import { build, getRegoCorePath } from '../../util/wasm-build.util';
import { getRegoRuleTemplatePath } from '../../util/rego-transpiler.util';
import { LoadedPolicy, loadPolicy } from '@open-policy-agent/opa-wasm';
import { POLICY_ENTRYPOINT } from '../../../open-policy-agent.constant';
import { ConfigModule, ConfigService } from '@narval/config-module'
import {
  FIXTURE,
  ValueOperators,
} from '@narval/policy-engine-shared'
import { Path, PathValue } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Config, load } from '../../../../policy-engine.config'


const getConfig = async <P extends Path<Config>>(propertyPath: P): Promise<PathValue<Config, P>> => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ load: [load] })]
  }).compile()

  const service = module.get<ConfigService<Config>>(ConfigService)

  return service.get(propertyPath)
}

describe('to_number in WebAssembly', () => {
  let wasm;
  let opa: LoadedPolicy;

  beforeAll(async () => {
    const resourcePath = await getConfig('resourcePath')
    wasm = await build({
      policies: [{
        id: 'can transfer 1 wei',
        description: 'Permit to transfer up to 1 wei',
        when: [
          {
            criterion: 'checkIntentAmount',
            args: {
              value: '10000000',
              operator: 'gte' as ValueOperators
            }
          }
        ],
        then: 'permit'
      }],
        path: `/tmp/armory-policy-bundle-${'someId'}`,
        regoCorePath: getRegoCorePath(resourcePath),
        regoRuleTemplatePath: getRegoRuleTemplatePath(resourcePath)
      })
      
      opa = await loadPolicy(wasm, undefined, {
        'time.now_ns': () => new Date().getTime() * 1000000,
        'time.format': () => new Date().toISOString().split('T')[0],
        'time.parse_ns': () => {
          const now = new Date()
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          return startOfDay.getTime() * 1000000
        },
      })
      opa.setData(FIXTURE.ENTITIES)
  })
  const testCases = [
    { input: "9223372036854775807", expected: [{"result": {"default": false, "permit": true, "reasons": ['can transfer 1 wei']}}], description: "2^63 - 1" },
    { input: "9223372036854775808", expected: [{"result": {"default": false, "permit": true, "reasons": ['can transfer 1 wei']}}], description: "2^63" },
    { input: "9223372036854776000", expected: [{"result": {"default": false, "permit": true, "reasons": ['can transfer 1 wei']}}], description: "Slightly above 2^63" },
    { input: "18446744073709551615", expected: [{"result": {"default": false, "permit": true, "reasons": ['can transfer 1 wei']}}], description: "2^64 - 1" },
    { input: "18446744073709551616", expected: [{"result": {"default": false, "permit": true, "reasons": ['can transfer 1 wei']}}], description: "2^64" },
    { input: "18446744073709551617", expected: [{"result": {"default": false, "permit": true, "reasons": ['can transfer 1 wei']}}], description: "2^64 + 1" },
  ];

  test.each(testCases)('handles $description correctly', async ({ input, expected }) => {
    const result = await opa.evaluate(input, POLICY_ENTRYPOINT)
    expect(result).toEqual(expected);
  });
});