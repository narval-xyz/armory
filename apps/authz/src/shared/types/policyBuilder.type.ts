import { AccountId, Action, Address, Alg, AssetId, Hex } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { AccountType } from './domain.type'

enum PolicyRuleType {
  PERMIT = 'permit',
  FORBID = 'forbid'
}

enum PolicyCriteriaType {
  RULE_TYPE = 'ruleType',
  ACTION = 'action',
  PRINCIPAL_ID = 'principalId',
  PRINCIPAL_ROLE = 'principalRole',
  PRINCIPAL_GROUP = 'principalGroup',
  WALLET_ID = 'walletId',
  WALLET_ADDRESS = 'walletAddress',
  WALLET_ACCOUNT_TYPE = 'walletAccountType',
  WALLET_CHAIN_ID = 'walletChainId',
  WALLET_GROUP = 'walletGroup',
  INTENT_TYPE = 'intentType',
  INTENT_DESTINATION_ID = 'intentDestinationId',
  INTENT_DESTINATION_ADDRESS = 'intentDestinationAddress',
  INTENT_DESTINATION_ACCOUNT_TYPE = 'intentDestinationAccountType',
  INTENT_DESTINATION_CLASSIFICATION = 'intentDestinationClassification',
  INTENT_CONTRACT_ADDRESS = 'intentContractAddress',
  INTENT_TOKEN_ADDRESS = 'intentTokenAddress',
  INTENT_SPENDER_ADDRESS = 'intentSpenderAddress',
  INTENT_CHAIN_ID = 'intentChainId',
  INTENT_HEX_SIGNATURE = 'intentHexSignature',
  INTENT_AMOUNT = 'intentAmount',
  INTENT_ERC721_TOKEN_ID = 'intentERC721TokenId',
  INTENT_ERC1155_TOKEN_ID = 'intentERC1155TokenId',
  INTENT_ERC1155_TRANSFERS = 'intentERC1155Transfers',
  INTENT_SIGN_MESSAGE = 'intentSignMessage',
  INTENT_SIGN_RAW_PAYLOAD = 'intentSignRawPayload',
  INTENT_SIGN_RAW_PAYLOAD_ALGORITHM = 'intentSignRawPayloadAlgorithm',
  INTENT_SIGN_TYPED_DATA_DOMAIN = 'intentSignTypedDataDomain',
  INTENT_PERMIT_DEADLINE = 'intentPermitDeadline',
  APPROVAL = 'approval',
  ACCUMULATION = 'accumulation'
}

type Wildcard = '*'

type NarvalEntityTypes = 'Narval::User' | 'Narval::UserRole' | 'Narval::UserGroup'

type Operators = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'

type Currency = 'fiat:usd' | 'fiat:eur'

type AmountCondition = {
  currency: Currency | Wildcard
  operator: Operators
  value: string
}

type ERC1155AmountCondition = {
  tokenId: AssetId
  operator: Operators
  value: string
}

type SignMessageCondition = {
  operator: 'equals' | 'contains'
  value: string
}

type SignTypedDataDomainCondition = {
  version?: string[]
  chainId?: number[]
  name?: string[]
  verifyingContract?: Address[]
}

type PermitDeadlineCondition = {
  operator: Operators
  value: string // timestamp in ms
}

type ApprovalCondition = {
  approvalCount: number
  countPrincipal: boolean
  approvalEntityType: NarvalEntityTypes
  entityIds: string[]
}

type AccumulationCondition = {
  rollingWindow: number // in seconds
  limit: string
  filters: {
    currency?: Currency
    tokens?: AccountId[]
    users?: string[]
    resources?: AccountId[]
    chains?: number[]
    userGroups?: string[]
    walletGroups?: string[]
  }
}

type ActionCriteria = {
  criteria: PolicyCriteriaType.ACTION
  args: Action[]
}

type PrincipalIdCriteria = {
  criteria: PolicyCriteriaType.PRINCIPAL_ID
  args: string[]
}

type PrincipalRoleCriteria = {
  criteria: PolicyCriteriaType.PRINCIPAL_ROLE
  args: string[]
}

type PrincipalGroupCriteria = {
  criteria: PolicyCriteriaType.PRINCIPAL_GROUP
  args: string[]
}

type WalletIdCriteria = {
  criteria: PolicyCriteriaType.WALLET_ID
  args: AccountId[]
}

type WalletAddressCriteria = {
  criteria: PolicyCriteriaType.WALLET_ADDRESS
  args: string[]
}

type WalletAccountTypeCriteria = {
  criteria: PolicyCriteriaType.WALLET_ACCOUNT_TYPE
  args: AccountType[]
}

type WalletChainIdCriteria = {
  criteria: PolicyCriteriaType.WALLET_CHAIN_ID
  args: number[]
}

type WalletGroupCriteria = {
  criteria: PolicyCriteriaType.WALLET_GROUP
  args: string[]
}

type IntentTypeCriteria = {
  criteria: PolicyCriteriaType.INTENT_TYPE
  args: Intents[]
}

type IntentDestinationIdCriteria = {
  criteria: PolicyCriteriaType.INTENT_DESTINATION_ID
  args: AccountId[]
}

type IntentDestinationAddressCriteria = {
  criteria: PolicyCriteriaType.INTENT_DESTINATION_ADDRESS
  args: string[]
}

type IntentDestinationAccountTypeCriteria = {
  criteria: PolicyCriteriaType.INTENT_DESTINATION_ACCOUNT_TYPE
  args: AccountType[]
}

type IntentDestinationClassificationCriteria = {
  criteria: PolicyCriteriaType.INTENT_DESTINATION_CLASSIFICATION
  args: string[]
}

type IntentContractAddressCriteria = {
  criteria: PolicyCriteriaType.INTENT_CONTRACT_ADDRESS
  args: AccountId[]
}

type IntentTokenAddressCriteria = {
  criteria: PolicyCriteriaType.INTENT_TOKEN_ADDRESS
  args: AccountId[]
}

type IntentSpenderAddressCriteria = {
  criteria: PolicyCriteriaType.INTENT_SPENDER_ADDRESS
  args: AccountId[]
}

type IntentChainIdCriteria = {
  criteria: PolicyCriteriaType.INTENT_CHAIN_ID
  args: number[]
}

type IntentHexSignatureCriteria = {
  criteria: PolicyCriteriaType.INTENT_HEX_SIGNATURE
  args: Hex[]
}

type IntentAmountCriteria = {
  criteria: PolicyCriteriaType.INTENT_AMOUNT
  args: AmountCondition
}

type IntentERC721TokenIdCriteria = {
  criteria: PolicyCriteriaType.INTENT_ERC721_TOKEN_ID
  args: AssetId[]
}

type IntentERC1155TokenIdCriteria = {
  criteria: PolicyCriteriaType.INTENT_ERC1155_TOKEN_ID
  args: AssetId[]
}

type IntentERC1155TransfersCriteria = {
  criteria: PolicyCriteriaType.INTENT_ERC1155_TRANSFERS
  args: ERC1155AmountCondition[]
}

type IntentSignMessageCriteria = {
  criteria: PolicyCriteriaType.INTENT_SIGN_MESSAGE
  args: SignMessageCondition
}

type IntentSignRawPayloadCriteria = {
  criteria: PolicyCriteriaType.INTENT_SIGN_RAW_PAYLOAD
  args: string[]
}

type IntentSignRawPayloadAlgorithmCriteria = {
  criteria: PolicyCriteriaType.INTENT_SIGN_RAW_PAYLOAD_ALGORITHM
  args: Alg[]
}

type IntentSignTypedDataDomainCriteria = {
  criteria: PolicyCriteriaType.INTENT_SIGN_TYPED_DATA_DOMAIN
  args: SignTypedDataDomainCondition
}

type IntentPermitDeadlineCriteria = {
  criteria: PolicyCriteriaType.INTENT_PERMIT_DEADLINE
  args: PermitDeadlineCondition
}

type ApprovalCriteria = {
  criteria: PolicyCriteriaType.APPROVAL
  args: ApprovalCondition[]
}

type AccumulationCriteria = {
  criteria: PolicyCriteriaType.ACCUMULATION
  args: AccumulationCondition
}

type PolicyCriteriaArgs =
  | ActionCriteria
  | PrincipalIdCriteria
  | PrincipalRoleCriteria
  | PrincipalGroupCriteria
  | WalletIdCriteria
  | WalletAddressCriteria
  | WalletAccountTypeCriteria
  | WalletChainIdCriteria
  | WalletGroupCriteria
  | IntentTypeCriteria
  | IntentDestinationIdCriteria
  | IntentDestinationAddressCriteria
  | IntentDestinationAccountTypeCriteria
  | IntentDestinationClassificationCriteria
  | IntentContractAddressCriteria
  | IntentTokenAddressCriteria
  | IntentSpenderAddressCriteria
  | IntentChainIdCriteria
  | IntentHexSignatureCriteria
  | IntentAmountCriteria
  | IntentERC721TokenIdCriteria
  | IntentERC1155TokenIdCriteria
  | IntentERC1155TransfersCriteria
  | IntentSignMessageCriteria
  | IntentSignRawPayloadCriteria
  | IntentSignRawPayloadAlgorithmCriteria
  | IntentSignTypedDataDomainCriteria
  | IntentPermitDeadlineCriteria
  | ApprovalCriteria
  | AccumulationCriteria

type PolicyCriteriaBuilder = {
  type: PolicyRuleType
  name: string
  criteria: PolicyCriteriaArgs[]
}

const examplePermitPolicy: PolicyCriteriaBuilder = {
  type: PolicyRuleType.PERMIT,
  name: 'examplePermitPolicy',
  criteria: [
    {
      criteria: PolicyCriteriaType.ACTION,
      args: [Action.SIGN_TRANSACTION]
    },
    {
      criteria: PolicyCriteriaType.PRINCIPAL_ID,
      args: ['matt@narval.xyz']
    },
    {
      criteria: PolicyCriteriaType.WALLET_ID,
      args: ['eip155:137/0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
    },
    {
      criteria: PolicyCriteriaType.INTENT_TYPE,
      args: [Intents.TRANSFER_NATIVE]
    },
    {
      criteria: PolicyCriteriaType.INTENT_TOKEN_ADDRESS,
      args: ['eip155:137/slip44/966']
    },
    {
      criteria: PolicyCriteriaType.INTENT_AMOUNT,
      args: { currency: '*', operator: 'lte', value: '1000000000000000000' }
    },
    {
      criteria: PolicyCriteriaType.APPROVAL,
      args: [
        {
          approvalCount: 2,
          countPrincipal: false,
          approvalEntityType: 'Narval::User',
          entityIds: ['aa@narval.xyz', 'bb@narval.xyz']
        },
        {
          approvalCount: 1,
          countPrincipal: false,
          approvalEntityType: 'Narval::UserRole',
          entityIds: ['admin']
        }
      ]
    }
  ]
}

const exampleForbidPolicy: PolicyCriteriaBuilder = {
  type: PolicyRuleType.FORBID,
  name: 'exampleForbidPolicy',
  criteria: [
    {
      criteria: PolicyCriteriaType.ACTION,
      args: [Action.SIGN_TRANSACTION]
    },
    {
      criteria: PolicyCriteriaType.PRINCIPAL_ID,
      args: ['matt@narval.xyz']
    },
    {
      criteria: PolicyCriteriaType.WALLET_ID,
      args: ['eip155:137/0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
    },
    {
      criteria: PolicyCriteriaType.INTENT_TYPE,
      args: [Intents.TRANSFER_NATIVE]
    },
    {
      criteria: PolicyCriteriaType.INTENT_TOKEN_ADDRESS,
      args: ['eip155:137/slip44/966']
    },
    {
      criteria: PolicyCriteriaType.ACCUMULATION,
      args: {
        rollingWindow: 12 * 60 * 60,
        limit: '1000000000000000000',
        filters: {
          tokens: ['eip155:137/slip44/966'],
          users: ['matt@narval.xyz']
        }
      }
    }
  ]
}
