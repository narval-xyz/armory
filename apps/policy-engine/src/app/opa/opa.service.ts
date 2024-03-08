import { FIXTURE, Policy } from '@narval/policy-engine-shared'
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import Handlebars from 'handlebars'
import { indexBy } from 'lodash/fp'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { RegoData, UserGroup, WalletGroup } from '../../shared/type/entities.types'
import { OpaResult, RegoInput } from '../../shared/type/rego'
import { criterionToString, reasonToString } from '../../shared/utils/opa.utils'
import { EntityRepository } from '../persistence/repository/entity.repository'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never
type OpaEngine = PromiseType<ReturnType<typeof loadPolicy>>

const OPA_WASM_PATH = path.join(process.cwd(), './rego-build/policy.wasm')

@Injectable()
export class OpaService implements OnApplicationBootstrap {
  private logger = new Logger(OpaService.name)
  private opaEngine: OpaEngine | undefined

  constructor(private entityRepository: EntityRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('OPA Service boot')
    try {
      const policyWasm = readFileSync(OPA_WASM_PATH)
      const opaEngine = await loadPolicy(policyWasm, undefined, {
        'time.now_ns': () => new Date().getTime() * 1000000 // TODO: @sam this happens on app bootstrap one time; if you need a timestamp per-request then this needs to be passed in w/ Entity data not into the Policy.
      })
      this.opaEngine = opaEngine
      await this.reloadEntityData()
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.logger.error(`Policy wasm not found at ${OPA_WASM_PATH}`)
      } else {
        throw err
      }
    }
  }

  async evaluate(input: RegoInput): Promise<OpaResult[]> {
    this.opaEngine = await this.getOpaEngine()
    const evalResult: { result: OpaResult }[] = await this.opaEngine.evaluate(input, 'main/evaluate')
    return evalResult.map(({ result }) => result)
  }

  generateRegoPolicies(payload: Policy[]): { fileId: string; policies: Policy[] } {
    Handlebars.registerHelper('criterion', criterionToString)

    Handlebars.registerHelper('reason', reasonToString)

    const templateSource = readFileSync('./apps/policy-engine/src/opa/template/template.hbs', 'utf-8')

    const template = Handlebars.compile(templateSource)

    const policies = payload.map((p) => ({ ...p, id: uuid() }))

    const regoContent = template({ policies })

    const fileId = uuid()

    const basePath = './apps/policy-engine/src/opa/rego/generated'

    mkdirSync(basePath, { recursive: true })

    writeFileSync(`${basePath}/${fileId}.rego`, regoContent, 'utf-8')

    this.logger.log('Policy .rego file generated successfully.')

    return { fileId, policies }
  }

  async fetchEntityData(): Promise<RegoData> {
    const entities = await this.entityRepository.fetch(FIXTURE.ORGANIZATION.id)

    const userGroups = entities.userGroupMembers.reduce((groups, { userId, groupId }) => {
      const group = groups.get(groupId)

      if (group) {
        return groups.set(groupId, {
          id: groupId,
          users: group.users.concat(userId)
        })
      } else {
        return groups.set(groupId, { id: groupId, users: [userId] })
      }
    }, new Map<string, UserGroup>())

    const walletGroups = entities.walletGroupMembers.reduce((groups, { walletId, groupId }) => {
      const group = groups.get(groupId)

      if (group) {
        return groups.set(groupId, {
          id: groupId,
          wallets: group.wallets.concat(walletId)
        })
      } else {
        return groups.set(groupId, { id: groupId, wallets: [walletId] })
      }
    }, new Map<string, WalletGroup>())

    const data: RegoData = {
      entities: {
        addressBook: indexBy('id', entities.addressBook),
        tokens: indexBy('id', entities.tokens),
        users: indexBy('id', entities.users),
        userGroups: Object.fromEntries(userGroups),
        wallets: indexBy('id', entities.wallets),
        walletGroups: Object.fromEntries(walletGroups)
      }
    }

    return data
  }

  async reloadEntityData() {
    if (!this.opaEngine) throw new Error('OPA Engine not initialized')

    try {
      const data = await this.fetchEntityData()
      this.opaEngine.setData(data)
      this.logger.log('Reloaded OPA Engine data')
    } catch (error) {
      this.logger.error('Failed to bootstrap OPA service')
    }
  }

  private async getOpaEngine(): Promise<OpaEngine> {
    // Attempt to initialize it if it for some reason isn't.
    if (!this.opaEngine) await this.onApplicationBootstrap()
    if (!this.opaEngine) throw new Error('OPA Engine not initialized')
    return this.opaEngine
  }
}
