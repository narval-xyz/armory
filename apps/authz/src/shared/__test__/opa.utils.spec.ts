import { EntityType, ValueOperators } from '@narval/authz-shared'
import {
  ApprovalsCriterion,
  Criterion,
  ERC1155TransfersCriterion,
  IntentAmountCriterion,
  NonceRequiredCriterion,
  Policy,
  Then,
  WalletAddressCriterion
} from '../types/policy.type'
import { criterionToString, reasonToString } from '../utils/opa.utils'

describe('criterionToString', () => {
  test('returns criterion if args are null', () => {
    const item: NonceRequiredCriterion = {
      criterion: Criterion.CHECK_NONCE_EXISTS,
      args: null
    }
    expect(criterionToString(item)).toEqual(Criterion.CHECK_NONCE_EXISTS)
  })

  test('returns criterion if args is an array of strings', () => {
    const item: WalletAddressCriterion = {
      criterion: Criterion.CHECK_WALLET_ADDRESS,
      args: ['0x123', '0x456']
    }
    expect(criterionToString(item)).toEqual(`${Criterion.CHECK_WALLET_ADDRESS}({"0x123", "0x456"})`)
  })

  test('returns criterion if args is an array of objects', () => {
    const item: ERC1155TransfersCriterion = {
      criterion: Criterion.CHECK_ERC1155_TRANSFERS,
      args: [{ tokenId: 'eip155:137/erc1155:0x12345/123', operator: ValueOperators.LESS_THAN_OR_EQUAL, value: '5' }]
    }
    expect(criterionToString(item)).toEqual(
      `${Criterion.CHECK_ERC1155_TRANSFERS}([${item.args.map((el) => JSON.stringify(el)).join(', ')}])`
    )
  })

  test('returns criterion if args is an object', () => {
    const item: IntentAmountCriterion = {
      criterion: Criterion.CHECK_INTENT_AMOUNT,
      args: {
        currency: '*',
        operator: ValueOperators.LESS_THAN_OR_EQUAL,
        value: '1000000000000000000'
      }
    }
    expect(criterionToString(item)).toEqual(`${Criterion.CHECK_INTENT_AMOUNT}(${JSON.stringify(item.args)})`)
  })

  test('returns approvals criterion', () => {
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
    expect(criterionToString(item)).toEqual(
      `approvals = ${Criterion.CHECK_APPROVALS}([${item.args.map((el) => JSON.stringify(el)).join(', ')}])`
    )
  })
})

describe('reasonToString', () => {
  test('returns reason for PERMIT rules', () => {
    const item: Policy = {
      then: Then.PERMIT,
      name: 'policyId',
      when: []
    }
    expect(reasonToString(item)).toBe(
      'reason = {"type":"permit","policyId":"policyId","approvalsSatisfied":approvals.approvalsSatisfied,"approvalsMissing":approvals.approvalsMissing}'
    )
  })

  test('returns reason for FORBID rules', () => {
    const item: Policy = {
      then: Then.FORBID,
      name: 'policyId',
      when: []
    }
    expect(reasonToString(item)).toBe(
      'reason = {"type":"forbid","policyId":"policyId","approvalsSatisfied":[],"approvalsMissing":[]}'
    )
  })
})
