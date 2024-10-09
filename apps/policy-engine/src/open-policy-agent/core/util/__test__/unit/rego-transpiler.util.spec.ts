import { ConfigModule, ConfigService } from '@narval/config-module'
import {
  AccountAddressCriterion,
  ApprovalsCriterion,
  Criterion,
  ERC1155TransfersCriterion,
  EntityType,
  FIXTURE,
  IntentAmountCriterion,
  NonceRequiredCriterion,
  Then,
  ValueOperators
} from '@narval/policy-engine-shared'
import { Path, PathValue } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Config, load } from '../../../../../policy-engine.config'
import { getRegoRuleTemplatePath, transpile, transpileCriterion, transpileReason } from '../../rego-transpiler.util'

const getConfig = async <P extends Path<Config>>(propertyPath: P): Promise<PathValue<Config, P>> => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ load: [load] })]
  }).compile()

  const service = module.get<ConfigService<Config>>(ConfigService)

  return service.get(propertyPath)
}

const getTemplatePath = async () => getRegoRuleTemplatePath(await getConfig('resourcePath'))

describe('transpile', () => {
  it('transpiles rego rules based on the given policies', async () => {
    const rules = await transpile(FIXTURE.POLICIES, await getTemplatePath())

    expect(rules).toContain('permit')
  })
})

describe('transpileCriterion', () => {
  it('returns criterion if args are null', () => {
    const item: NonceRequiredCriterion = {
      criterion: Criterion.CHECK_NONCE_EXISTS,
      args: null
    }
    expect(transpileCriterion(item)).toEqual(`criteria.${Criterion.CHECK_NONCE_EXISTS}`)
  })

  it('returns criterion if args is an array of strings', () => {
    const item: AccountAddressCriterion = {
      criterion: Criterion.CHECK_ACCOUNT_ADDRESS,
      args: ['0x123', '0x456']
    }

    expect(transpileCriterion(item)).toEqual(`criteria.${Criterion.CHECK_ACCOUNT_ADDRESS}({"0x123", "0x456"})`)
  })

  it('returns criterion if args is an array of objects', () => {
    const item: ERC1155TransfersCriterion = {
      criterion: Criterion.CHECK_ERC1155_TRANSFERS,
      args: [{ tokenId: 'eip155:137/erc1155:0x12345/123', operator: ValueOperators.LESS_THAN_OR_EQUAL, value: '5' }]
    }

    expect(transpileCriterion(item)).toEqual(
      `criteria.${Criterion.CHECK_ERC1155_TRANSFERS}([${item.args.map((el) => JSON.stringify(el)).join(', ')}])`
    )
  })

  it('returns criterion if args is an object', () => {
    const item: IntentAmountCriterion = {
      criterion: Criterion.CHECK_INTENT_AMOUNT,
      args: {
        operator: ValueOperators.LESS_THAN_OR_EQUAL,
        value: '1000000000000000000'
      }
    }

    expect(transpileCriterion(item)).toEqual(`criteria.${Criterion.CHECK_INTENT_AMOUNT}(${JSON.stringify(item.args)})`)
  })

  it('returns approvals criterion', () => {
    const item: ApprovalsCriterion = {
      criterion: Criterion.CHECK_APPROVALS,
      args: [
        {
          approvalCount: 2,
          countPrincipal: false,
          approvalEntityType: EntityType.User,
          entityIds: ['aa@narval.xyz']
        }
      ]
    }

    expect(transpileCriterion(item)).toEqual(
      `approvals = criteria.${Criterion.CHECK_APPROVALS}([${item.args.map((el) => JSON.stringify(el)).join(', ')}])`
    )
  })
})

describe('transpileReason', () => {
  it('returns reason with approvals for PERMIT rules', () => {
    const item = {
      id: '12345',
      then: Then.PERMIT,
      description: 'policyName',
      when: [
        {
          criterion: Criterion.CHECK_APPROVALS,
          args: [{ approvalCount: 2, countPrincipal: false, approvalEntityType: EntityType.User, entityIds: [] }]
        }
      ]
    }

    expect(transpileReason(item)).toEqual(
      'reason = {"type":"permit","policyId":"12345","policyName":"policyName","approvalsSatisfied":approvals.approvalsSatisfied,"approvalsMissing":approvals.approvalsMissing}'
    )
  })

  it('returns reason without approvals for PERMIT rules', () => {
    const item = {
      id: '12345',
      then: Then.PERMIT,
      description: 'policyName',
      when: []
    }

    expect(transpileReason(item)).toEqual(
      'reason = {"type":"permit","policyId":"12345","policyName":"policyName","approvalsSatisfied":[],"approvalsMissing":[]}'
    )
  })

  it('returns reason for FORBID rules', () => {
    const item = {
      id: '12345',
      then: Then.FORBID,
      description: 'policyName',
      when: []
    }

    expect(transpileReason(item)).toEqual(
      'reason = {"type":"forbid","policyId":"12345","policyName":"policyName","approvalsSatisfied":[],"approvalsMissing":[]}'
    )
  })
})
