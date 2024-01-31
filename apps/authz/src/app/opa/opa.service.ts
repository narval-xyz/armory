import { OrganizationRepository } from '@app/authz/app/persistence/repository/organization.repository'
import { OpaResult, RegoInput } from '@app/authz/shared/types/rego'
import { Injectable, Logger } from '@nestjs/common'
import { loadPolicy } from '@open-policy-agent/opa-wasm'
import { readFileSync } from 'fs'
import path from 'path'

type PromiseType<T extends Promise<unknown>> = T extends Promise<infer U> ? U : never
type OpaEngine = PromiseType<ReturnType<typeof loadPolicy>>

const OPA_WASM_PATH = path.join(process.cwd(), './rego-build/policy.wasm')

@Injectable()
export class OpaService {
  private logger = new Logger(OpaService.name)
  private opaEngine: OpaEngine | undefined

  constructor(private organizationRepository: OrganizationRepository) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.log('OPA Service boot')
    this.opaEngine = await this.getOpaEngine()
  }

  async evaluate(input: RegoInput): Promise<OpaResult[]> {
    this.opaEngine = await this.getOpaEngine()
    const evalResult: { result: OpaResult }[] = await this.opaEngine.evaluate(input, 'main/evaluate')
    return evalResult.map(({ result }) => result)
  }

  private async getOpaEngine(): Promise<OpaEngine> {
    const policyWasmPath = OPA_WASM_PATH
    const policyWasm = readFileSync(policyWasmPath)
    const opaEngine = await loadPolicy(policyWasm, undefined, {
      'time.now_ns': () => new Date().getTime() * 1000000
    })
    const data = await this.organizationRepository.getEntityData()
    opaEngine.setData(data)
    return opaEngine
  }
}
