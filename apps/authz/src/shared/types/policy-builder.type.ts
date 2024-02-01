import { AccountId, Action, Address, Alg, AssetId, Hex } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { AccountType } from './domain.type'

enum PolicyRuleType {
  PERMIT = 'permit',
  FORBID = 'forbid'
}

enum PolicyCriteriaType {
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
  INTENT_CONTRACT = 'intentContract',
  INTENT_TOKEN = 'intentToken',
  INTENT_SPENDER = 'intentSpender',
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
  TRANSACTION_REQUEST_GAS_FEES = 'transactionRequestGasFees',
  TRANSACTION_REQUEST_NONCE_REQUIRED = 'transactionRequestNonceRequired',
  TRANSACTION_REQUEST_NONCE_NOT_REQUIRED = 'transactionRequestNonceNotRequired',
  APPROVALS = 'approvals',
  SPENDING_LIMIT = 'spendingLimit'
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
  operator: 'eq' | 'contains'
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

type SpendingLimitCondition = {
  limit: string
  currency?: Currency
  filters?: {
    tokens?: AccountId[]
    users?: string[]
    resources?: AccountId[]
    chains?: number[]
    userGroups?: string[]
    walletGroups?: string[]
    startDate?: number // in seconds
    endDate?: number // in seconds
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
  args: string[]
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

type IntentContractCriteria = {
  criteria: PolicyCriteriaType.INTENT_CONTRACT
  args: AccountId[]
}

type IntentTokenCriteria = {
  criteria: PolicyCriteriaType.INTENT_TOKEN
  args: AccountId[]
}

type IntentSpenderCriteria = {
  criteria: PolicyCriteriaType.INTENT_SPENDER
  args: AccountId[]
}

type IntentChainIdCriteria = {
  criteria: PolicyCriteriaType.INTENT_CHAIN_ID
  args: string[]
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

type TransactionRequestGasFeesCriteria = {
  criteria: PolicyCriteriaType.TRANSACTION_REQUEST_GAS_FEES
  args: AmountCondition
}

type TransactionRequestNonceRequiredCriteria = {
  criteria: PolicyCriteriaType.TRANSACTION_REQUEST_NONCE_REQUIRED
}

type TransactionRequestNonceNotRequiredCriteria = {
  criteria: PolicyCriteriaType.TRANSACTION_REQUEST_NONCE_NOT_REQUIRED
}

type ApprovalCriteria = {
  criteria: PolicyCriteriaType.APPROVALS
  args: ApprovalCondition[]
}

type AccumulationCriteria = {
  criteria: PolicyCriteriaType.SPENDING_LIMIT
  args: SpendingLimitCondition
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
  | IntentContractCriteria
  | IntentTokenCriteria
  | IntentSpenderCriteria
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
  | TransactionRequestGasFeesCriteria
  | TransactionRequestNonceRequiredCriteria
  | TransactionRequestNonceNotRequiredCriteria
  | ApprovalCriteria
  | AccumulationCriteria

export type PolicyCriteriaBuilder = {
  type: PolicyRuleType
  name: string
  criteria: PolicyCriteriaArgs[]
}

export const regoCriteriaMapping = {
  [PolicyCriteriaType.ACTION]: 'checkAction',
  [PolicyCriteriaType.PRINCIPAL_ID]: 'checkPrincipalId',
  [PolicyCriteriaType.PRINCIPAL_ROLE]: 'checkPrincipalRole',
  [PolicyCriteriaType.PRINCIPAL_GROUP]: 'checkPrincipalGroup',
  [PolicyCriteriaType.WALLET_ID]: 'checkWalletId',
  [PolicyCriteriaType.WALLET_ADDRESS]: 'checkWalletAddress',
  [PolicyCriteriaType.WALLET_ACCOUNT_TYPE]: 'checkWalletAccountType',
  [PolicyCriteriaType.WALLET_CHAIN_ID]: 'checkWalletChainId',
  [PolicyCriteriaType.WALLET_GROUP]: 'checkWalletGroup',
  [PolicyCriteriaType.INTENT_TYPE]: 'checkIntentType',
  [PolicyCriteriaType.INTENT_DESTINATION_ID]: 'checkDestinationId',
  [PolicyCriteriaType.INTENT_DESTINATION_ADDRESS]: 'checkIntentDestinationAddress',
  [PolicyCriteriaType.INTENT_DESTINATION_ACCOUNT_TYPE]: 'checkIntentDestinationAccountType',
  [PolicyCriteriaType.INTENT_DESTINATION_CLASSIFICATION]: 'checkDestinationClassification',
  [PolicyCriteriaType.INTENT_CONTRACT]: 'checkIntentContract',
  [PolicyCriteriaType.INTENT_TOKEN]: 'checkIntentToken',
  [PolicyCriteriaType.INTENT_SPENDER]: 'checkIntentSpender',
  [PolicyCriteriaType.INTENT_CHAIN_ID]: 'checkIntentChainId',
  [PolicyCriteriaType.INTENT_HEX_SIGNATURE]: 'checkIntentHexSignature',
  [PolicyCriteriaType.INTENT_AMOUNT]: 'checkIntentAmount',
  [PolicyCriteriaType.INTENT_ERC721_TOKEN_ID]: 'checkERC721TokenId',
  [PolicyCriteriaType.INTENT_ERC1155_TOKEN_ID]: 'checkERC1155TokenId',
  [PolicyCriteriaType.INTENT_ERC1155_TRANSFERS]: 'checkERC1155Transfers',
  [PolicyCriteriaType.INTENT_SIGN_MESSAGE]: 'checkIntentMessage',
  [PolicyCriteriaType.INTENT_SIGN_RAW_PAYLOAD]: 'checkIntentPayload',
  [PolicyCriteriaType.INTENT_SIGN_RAW_PAYLOAD_ALGORITHM]: 'checkIntentAlgorithm',
  [PolicyCriteriaType.INTENT_SIGN_TYPED_DATA_DOMAIN]: 'checkIntentDomain',
  [PolicyCriteriaType.INTENT_PERMIT_DEADLINE]: 'checkPermitDeadline',
  [PolicyCriteriaType.TRANSACTION_REQUEST_GAS_FEES]: 'checkGasFeeAmount',
  [PolicyCriteriaType.TRANSACTION_REQUEST_NONCE_REQUIRED]: 'checkNonceExists',
  [PolicyCriteriaType.TRANSACTION_REQUEST_NONCE_NOT_REQUIRED]: 'checkNonceNotExists',
  [PolicyCriteriaType.APPROVALS]: 'checkApprovals',
  [PolicyCriteriaType.SPENDING_LIMIT]: 'checkSpendingLimit'
}

// const examplePermitPolicy: PolicyCriteriaBuilder = {
//   type: PolicyRuleType.PERMIT,
//   name: 'examplePermitPolicy',
//   criteria: [
//     {
//       criteria: PolicyCriteriaType.ACTION,
//       args: [Action.SIGN_TRANSACTION]
//     },
//     {
//       criteria: PolicyCriteriaType.TRANSACTION_REQUEST_NONCE_REQUIRED
//     },
//     {
//       criteria: PolicyCriteriaType.PRINCIPAL_ID,
//       args: ['matt@narval.xyz']
//     },
//     {
//       criteria: PolicyCriteriaType.WALLET_ID,
//       args: ['eip155:137/0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
//     },
//     {
//       criteria: PolicyCriteriaType.INTENT_TYPE,
//       args: [Intents.TRANSFER_NATIVE]
//     },
//     {
//       criteria: PolicyCriteriaType.INTENT_TOKEN,
//       args: ['eip155:137/slip44:966']
//     },
//     {
//       criteria: PolicyCriteriaType.INTENT_AMOUNT,
//       args: { currency: '*', operator: 'lte', value: '1000000000000000000' }
//     },
//     {
//       criteria: PolicyCriteriaType.APPROVALS,
//       args: [
//         {
//           approvalCount: 2,
//           countPrincipal: false,
//           approvalEntityType: 'Narval::User',
//           entityIds: ['aa@narval.xyz', 'bb@narval.xyz']
//         },
//         {
//           approvalCount: 1,
//           countPrincipal: false,
//           approvalEntityType: 'Narval::UserRole',
//           entityIds: ['admin']
//         }
//       ]
//     }
//   ]
// }

// const exampleForbidPolicy: PolicyCriteriaBuilder = {
//   type: PolicyRuleType.FORBID,
//   name: 'exampleForbidPolicy',
//   criteria: [
//     {
//       criteria: PolicyCriteriaType.ACTION,
//       args: [Action.SIGN_TRANSACTION]
//     },
//     {
//       criteria: PolicyCriteriaType.TRANSACTION_REQUEST_NONCE_REQUIRED
//     },
//     {
//       criteria: PolicyCriteriaType.PRINCIPAL_ID,
//       args: ['matt@narval.xyz']
//     },
//     {
//       criteria: PolicyCriteriaType.WALLET_ID,
//       args: ['eip155:137/0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
//     },
//     {
//       criteria: PolicyCriteriaType.INTENT_TYPE,
//       args: [Intents.TRANSFER_NATIVE]
//     },
//     {
//       criteria: PolicyCriteriaType.INTENT_TOKEN,
//       args: ['eip155:137/slip44:966']
//     },
//     {
//       criteria: PolicyCriteriaType.SPENDING_LIMIT,
//       args: {
//         limit: '1000000000000000000',
//         filters: {
//           startDate: 12 * 60 * 60,
//           tokens: ['eip155:137/slip44:966'],
//           users: ['matt@narval.xyz']
//         }
//       }
//     }
//   ]
// }
