import {
  ApprovalsCriterion,
  Criterion,
  ERC1155TransfersCriterion,
  EntityType,
  IntentAmountCriterion,
  NonceRequiredCriterion,
  Then,
  ValueOperators,
  WalletAddressCriterion
} from '@narval/policy-engine-shared'
import { criterionToString, reasonToString } from '../../utils/opa.utils'

describe('criterionToString', () => {
  it('returns criterion if args are null', () => {
    const item: NonceRequiredCriterion = {
      criterion: Criterion.CHECK_NONCE_EXISTS,
      args: null
    }
    expect(criterionToString(item)).toEqual(Criterion.CHECK_NONCE_EXISTS)
  })

  it('returns criterion if args is an array of strings', () => {
    const item: WalletAddressCriterion = {
      criterion: Criterion.CHECK_WALLET_ADDRESS,
      args: ['0x123', '0x456']
    }
    expect(criterionToString(item)).toEqual(`${Criterion.CHECK_WALLET_ADDRESS}({"0x123", "0x456"})`)
  })

  it('returns criterion if args is an array of objects', () => {
    const item: ERC1155TransfersCriterion = {
      criterion: Criterion.CHECK_ERC1155_TRANSFERS,
      args: [{ tokenId: 'eip155:137/erc1155:0x12345/123', operator: ValueOperators.LESS_THAN_OR_EQUAL, value: '5' }]
    }
    expect(criterionToString(item)).toEqual(
      `${Criterion.CHECK_ERC1155_TRANSFERS}([${item.args.map((el) => JSON.stringify(el)).join(', ')}])`
    )
  })

  it('returns criterion if args is an object', () => {
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
    expect(criterionToString(item)).toEqual(
      `approvals = ${Criterion.CHECK_APPROVALS}([${item.args.map((el) => JSON.stringify(el)).join(', ')}])`
    )
  })
})

describe('reasonToString', () => {
  it('returns reason with approvals for PERMIT rules', () => {
    const item = {
      id: '12345',
      then: Then.PERMIT,
      name: 'policyName',
      when: [
        {
          criterion: Criterion.CHECK_APPROVALS,
          args: [{ approvalCount: 2, countPrincipal: false, approvalEntityType: EntityType.User, entityIds: [] }]
        }
      ]
    }
    expect(reasonToString(item)).toEqual(
      'reason = {"type":"permit","policyId":"12345","policyName":"policyName","approvalsSatisfied":approvals.approvalsSatisfied,"approvalsMissing":approvals.approvalsMissing}'
    )
  })

  it('returns reason without approvals for PERMIT rules', () => {
    const item = {
      id: '12345',
      then: Then.PERMIT,
      name: 'policyName',
      when: []
    }
    expect(reasonToString(item)).toEqual(
      'reason = {"type":"permit","policyId":"12345","policyName":"policyName","approvalsSatisfied":[],"approvalsMissing":[]}'
    )
  })

  it('returns reason for FORBID rules', () => {
    const item = {
      id: '12345',
      then: Then.FORBID,
      name: 'policyName',
      when: []
    }
    expect(reasonToString(item)).toEqual(
      'reason = {"type":"forbid","policyId":"12345","policyName":"policyName","approvalsSatisfied":[],"approvalsMissing":[]}'
    )
  })
})
