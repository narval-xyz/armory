import { AdminRepository } from '@app/authz/app/persistence/repository/admin.repository'
import { RegoData, User, UserGroup, WalletGroup } from '@app/authz/shared/types/entities.types'
import { OpaResult, RegoInput } from '@app/authz/shared/types/rego'
import { Criterion, Policy, Then } from '@narval/authz-shared'
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { readFileSync, writeFileSync } from 'fs'
import Handlebars from 'handlebars'
import { isEmpty } from 'lodash'
import path from 'path'
import * as R from 'remeda'
import { v4 as uuidv4 } from 'uuid'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never
type OpaEngine = PromiseType<ReturnType<typeof loadPolicy>>

const OPA_WASM_PATH = path.join(process.cwd(), './rego-build/policy.wasm')

@Injectable()
export class OpaService implements OnApplicationBootstrap {
  private logger = new Logger(OpaService.name)
  private opaEngine: OpaEngine | undefined

  constructor(private adminRepository: AdminRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('OPA Service boot')
    const policyWasmPath = OPA_WASM_PATH
    const policyWasm = readFileSync(policyWasmPath)
    const opaEngine = await loadPolicy(policyWasm, undefined, {
      'time.now_ns': () => new Date().getTime() * 1000000 // TODO: @sam this happens on app bootstrap one time; if you need a timestamp per-request then this needs to be passed in w/ Entity data not into the Policy.
    })
    this.opaEngine = opaEngine
    await this.reloadEntityData()
  }

  async evaluate(input: RegoInput): Promise<OpaResult[]> {
    this.opaEngine = await this.getOpaEngine()
    const evalResult: { result: OpaResult }[] = await this.opaEngine.evaluate(input, 'main/evaluate')
    return evalResult.map(({ result }) => result)
  }

  generateRegoFile(policies: Policy[]): void {
    Handlebars.registerHelper('criterion', function (item) {
      const criterion: Criterion = item.criterion
      const args = item.args

      if (args === null) {
        return `${criterion}`
      }

      if (!isEmpty(args)) {
        if (Array.isArray(args)) {
          if (typeof args[0] === 'string') {
            return `${criterion}({${args.map((el) => `"${el}"`).join(', ')}})`
          }

          if (criterion === Criterion.CHECK_APPROVALS) {
            return `approvals = ${criterion}([${args.map((el) => JSON.stringify(el)).join(', ')}])`
          }

          return `${criterion}([${args.map((el) => JSON.stringify(el)).join(', ')}])`
        }

        return `${criterion}(${JSON.stringify(args)})`
      }
    })

    Handlebars.registerHelper('reason', function (item) {
      if (item.then === Then.PERMIT) {
        const reason = [
          `"type": "${item.then}"`,
          `"policyId": "${item.name}"`,
          '"approvalsSatisfied": approvals.approvalsSatisfied',
          '"approvalsMissing": approvals.approvalsMissing'
        ]
        return `reason = {${reason.join(', ')}}`
      }

      if (item.then === Then.FORBID) {
        const reason = {
          type: item.then,
          policyId: item.name,
          approvalsSatisfied: [],
          approvalsMissing: []
        }
        return `reason = ${JSON.stringify(reason)}`
      }
    })

    const templateSource = readFileSync('./apps/authz/src/opa/template/template.hbs', 'utf-8')

    const template = Handlebars.compile(templateSource)

    const regoContent = template({ policies })

    writeFileSync(`./apps/authz/src/opa/rego/generated/${uuidv4()}.rego`, regoContent, 'utf-8')

    this.logger.log('Policy .rego file generated successfully.')
  }

  private async fetchEntityData(): Promise<RegoData> {
    const users = await this.adminRepository.getAllUsers()
    const wallets = await this.adminRepository.getAllWallets()
    const walletGroups = await this.adminRepository.getAllWalletGroups()
    const userWallets = await this.adminRepository.getAllUserWallets()
    const userGroups = await this.adminRepository.getAllUserGroups()
    const addressBook = await this.adminRepository.getAllAddressBook()
    const tokens = await this.adminRepository.getAllTokens()

    const regoUsers: Record<string, User> = R.indexBy(users, (u) => u.uid)
    const regoWallets = R.indexBy(wallets, (w) => w.uid)
    const regoAddressBook = R.indexBy(addressBook, (a) => a.uid)
    const regoTokens = R.indexBy(tokens, (t) => t.uid)

    // Add the assignees into the regoWallets
    userWallets.forEach((uw) => {
      if (regoWallets[uw.walletId]) {
        if (!regoWallets[uw.walletId].assignees) regoWallets[uw.walletId].assignees = []
        regoWallets[uw.walletId].assignees?.push(uw.userId)
      }
    })

    const regoUserGroups = userGroups.reduce((acc, ug) => {
      if (!acc[ug.userGroupId]) {
        acc[ug.userGroupId] = {
          uid: ug.userGroupId,
          users: []
        }
      }

      acc[ug.userGroupId].users.push(ug.userId)

      return acc
    }, {} as Record<string, UserGroup>)

    const regoWalletGroups = walletGroups.reduce((acc, ug) => {
      if (!acc[ug.walletGroupId]) {
        acc[ug.walletGroupId] = {
          uid: ug.walletGroupId,
          wallets: []
        }
      }

      acc[ug.walletGroupId].wallets.push(ug.walletId)

      return acc
    }, {} as Record<string, WalletGroup>)

    const mockData = await this.adminRepository.getEntityData()

    const regoData: RegoData = {
      entities: {
        users: regoUsers,
        wallets: regoWallets,
        userGroups: regoUserGroups,
        walletGroups: regoWalletGroups,
        addressBook: regoAddressBook,
        tokens: regoTokens
      }
    }
    this.logger.log('Fetched OPA Engine data', regoData)

    return mockData
  }

  async reloadEntityData() {
    if (!this.opaEngine) throw new Error('OPA Engine not initialized')
    const data = await this.fetchEntityData()
    this.opaEngine.setData(data)
    this.logger.log('Reloaded OPA Engine data')
  }

  private async getOpaEngine(): Promise<OpaEngine> {
    // Attempt to initialize it if it for some reason isn't.
    if (!this.opaEngine) await this.onApplicationBootstrap()
    if (!this.opaEngine) throw new Error('OPA Engine not initialized')
    return this.opaEngine
  }
}
