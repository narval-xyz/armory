import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import Handlebars from 'handlebars'
import { indexBy } from 'lodash/fp'
import { ORGANIZATION } from 'packages/authz-shared/src/lib/dev.fixture'
import path from 'path'
import { v4 as uuid } from 'uuid'
import { RegoData } from '../../shared/types/entities.types'
import { Policy } from '../../shared/types/policy.type'
import { OpaResult, RegoInput } from '../../shared/types/rego'
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
    const policyWasmPath = OPA_WASM_PATH
    try {
      const policyWasm = readFileSync(policyWasmPath)
      const opaEngine = await loadPolicy(policyWasm, undefined, {
        'time.now_ns': () => new Date().getTime() * 1000000 // TODO: @sam this happens on app bootstrap one time; if you need a timestamp per-request then this needs to be passed in w/ Entity data not into the Policy.
      })
      this.opaEngine = opaEngine
      await this.reloadEntityData()
    } catch (err) {
      if (err.code === 'ENOENT') {
        this.logger.error(`Policy wasm not found at ${policyWasmPath}`)
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

  buildPoliciesWasm(payload: Policy[]): { fileId: string; policies: Policy[] } {
    Handlebars.registerHelper('criterion', criterionToString)

    Handlebars.registerHelper('reason', reasonToString)

    const templateSource = readFileSync('./apps/authz/src/opa/template/template.hbs', 'utf-8')

    const template = Handlebars.compile(templateSource)

    const policies = payload.map((p) => ({ ...p, id: uuid() }))

    const regoContent = template({ policies })

    const fileId = uuid()

    writeFileSync(`./apps/authz/src/opa/rego/generated/${fileId}.rego`, regoContent, 'utf-8')

    this.logger.log('Policy .rego file generated successfully.')

    execSync('make authz/rego/build')

    this.logger.log('Policies .wasm file build successfully.')

    return { fileId, policies }
  }

  private async fetchEntityData(): Promise<RegoData> {
    const entities = await this.entityRepository.fetch(ORGANIZATION.uid)

    const data: RegoData = {
      entities: {
        addressBook: indexBy('uid', entities.addressBook),
        users: indexBy('uid', entities.users),
        userGroups: indexBy('uid', entities.userGroups),
        wallets: indexBy('uid', entities.wallets),
        walletGroups: indexBy('uid', entities.walletGroups),
        tokens: indexBy('uid', entities.tokens)
      }
    }

    this.logger.log('Fetched OPA Engine data', data)

    return data
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
