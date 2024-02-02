import { AccountId, Action, Address, Alg, AssetId, Hex } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { AccountType } from './domain.type'

enum Then {
  PERMIT = 'permit',
  FORBID = 'forbid'
}

enum Criterion {
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

type EntityType = 'Narval::User' | 'Narval::UserRole' | 'Narval::UserGroup'

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
  chainId?: string[]
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
  approvalEntityType: EntityType
  entityIds: string[]
}

type SpendingLimitCondition = {
  limit: string
  currency?: Currency
  timeWindow?: {
    type?: 'rolling' | 'fixed'
    value?: number // in seconds
    startDate?: number // in seconds
    endDate?: number // in seconds
  }
  filters?: {
    tokens?: AccountId[]
    users?: string[]
    resources?: AccountId[]
    chains?: string[]
    userGroups?: string[]
    walletGroups?: string[]
  }
}

type ActionCriterion = {
  criterion: Criterion.ACTION
  args: Action[]
}

type PrincipalIdCriterion = {
  criterion: Criterion.PRINCIPAL_ID
  args: string[]
}

type PrincipalRoleCriterion = {
  criterion: Criterion.PRINCIPAL_ROLE
  args: string[]
}

type PrincipalGroupCriterion = {
  criterion: Criterion.PRINCIPAL_GROUP
  args: string[]
}

type WalletIdCriterion = {
  criterion: Criterion.WALLET_ID
  args: AccountId[]
}

type WalletAddressCriterion = {
  criterion: Criterion.WALLET_ADDRESS
  args: string[]
}

type WalletAccountTypeCriterion = {
  criterion: Criterion.WALLET_ACCOUNT_TYPE
  args: AccountType[]
}

type WalletChainIdCriterion = {
  criterion: Criterion.WALLET_CHAIN_ID
  args: string[]
}

type WalletGroupCriterion = {
  criterion: Criterion.WALLET_GROUP
  args: string[]
}

type IntentTypeCriterion = {
  criterion: Criterion.INTENT_TYPE
  args: Intents[]
}

type IntentDestinationIdCriterion = {
  criterion: Criterion.INTENT_DESTINATION_ID
  args: AccountId[]
}

type IntentDestinationAddressCriterion = {
  criterion: Criterion.INTENT_DESTINATION_ADDRESS
  args: string[]
}

type IntentDestinationAccountTypeCriterion = {
  criterion: Criterion.INTENT_DESTINATION_ACCOUNT_TYPE
  args: AccountType[]
}

type IntentDestinationClassificationCriterion = {
  criterion: Criterion.INTENT_DESTINATION_CLASSIFICATION
  args: string[]
}

type IntentContractCriterion = {
  criterion: Criterion.INTENT_CONTRACT
  args: AccountId[]
}

type IntentTokenCriterion = {
  criterion: Criterion.INTENT_TOKEN
  args: AccountId[]
}

type IntentSpenderCriterion = {
  criterion: Criterion.INTENT_SPENDER
  args: AccountId[]
}

type IntentChainIdCriterion = {
  criterion: Criterion.INTENT_CHAIN_ID
  args: string[]
}

type IntentHexSignatureCriterion = {
  criterion: Criterion.INTENT_HEX_SIGNATURE
  args: Hex[]
}

type IntentAmountCriterion = {
  criterion: Criterion.INTENT_AMOUNT
  args: AmountCondition
}

type IntentERC721TokenIdCriterion = {
  criterion: Criterion.INTENT_ERC721_TOKEN_ID
  args: AssetId[]
}

type IntentERC1155TokenIdCriterion = {
  criterion: Criterion.INTENT_ERC1155_TOKEN_ID
  args: AssetId[]
}

type IntentERC1155TransfersCriterion = {
  criterion: Criterion.INTENT_ERC1155_TRANSFERS
  args: ERC1155AmountCondition[]
}

type IntentSignMessageCriterion = {
  criterion: Criterion.INTENT_SIGN_MESSAGE
  args: SignMessageCondition
}

type IntentSignRawPayloadCriterion = {
  criterion: Criterion.INTENT_SIGN_RAW_PAYLOAD
  args: string[]
}

type IntentSignRawPayloadAlgorithmCriterion = {
  criterion: Criterion.INTENT_SIGN_RAW_PAYLOAD_ALGORITHM
  args: Alg[]
}

type IntentSignTypedDataDomainCriterion = {
  criterion: Criterion.INTENT_SIGN_TYPED_DATA_DOMAIN
  args: SignTypedDataDomainCondition
}

type IntentPermitDeadlineCriterion = {
  criterion: Criterion.INTENT_PERMIT_DEADLINE
  args: PermitDeadlineCondition
}

type TransactionRequestGasFeesCriterion = {
  criterion: Criterion.TRANSACTION_REQUEST_GAS_FEES
  args: AmountCondition
}

type TransactionRequestNonceRequiredCriterion = {
  criterion: Criterion.TRANSACTION_REQUEST_NONCE_REQUIRED
}

type TransactionRequestNonceNotRequiredCriterion = {
  criterion: Criterion.TRANSACTION_REQUEST_NONCE_NOT_REQUIRED
}

type ApprovalCriterion = {
  criterion: Criterion.APPROVALS
  args: ApprovalCondition[]
}

type AccumulationCriterion = {
  criterion: Criterion.SPENDING_LIMIT
  args: SpendingLimitCondition
}

type PolicyCriterion =
  | ActionCriterion
  | PrincipalIdCriterion
  | PrincipalRoleCriterion
  | PrincipalGroupCriterion
  | WalletIdCriterion
  | WalletAddressCriterion
  | WalletAccountTypeCriterion
  | WalletChainIdCriterion
  | WalletGroupCriterion
  | IntentTypeCriterion
  | IntentDestinationIdCriterion
  | IntentDestinationAddressCriterion
  | IntentDestinationAccountTypeCriterion
  | IntentDestinationClassificationCriterion
  | IntentContractCriterion
  | IntentTokenCriterion
  | IntentSpenderCriterion
  | IntentChainIdCriterion
  | IntentHexSignatureCriterion
  | IntentAmountCriterion
  | IntentERC721TokenIdCriterion
  | IntentERC1155TokenIdCriterion
  | IntentERC1155TransfersCriterion
  | IntentSignMessageCriterion
  | IntentSignRawPayloadCriterion
  | IntentSignRawPayloadAlgorithmCriterion
  | IntentSignTypedDataDomainCriterion
  | IntentPermitDeadlineCriterion
  | TransactionRequestGasFeesCriterion
  | TransactionRequestNonceRequiredCriterion
  | TransactionRequestNonceNotRequiredCriterion
  | ApprovalCriterion
  | AccumulationCriterion

export type PolicyCriterionBuilder = {
  name: string
  type: Then
  when: PolicyCriterion[]
}

export const regoCriterionMapping = {
  [Criterion.ACTION]: 'checkAction',
  [Criterion.PRINCIPAL_ID]: 'checkPrincipalId',
  [Criterion.PRINCIPAL_ROLE]: 'checkPrincipalRole',
  [Criterion.PRINCIPAL_GROUP]: 'checkPrincipalGroup',
  [Criterion.WALLET_ID]: 'checkWalletId',
  [Criterion.WALLET_ADDRESS]: 'checkWalletAddress',
  [Criterion.WALLET_ACCOUNT_TYPE]: 'checkWalletAccountType',
  [Criterion.WALLET_CHAIN_ID]: 'checkWalletChainId',
  [Criterion.WALLET_GROUP]: 'checkWalletGroup',
  [Criterion.INTENT_TYPE]: 'checkIntentType',
  [Criterion.INTENT_DESTINATION_ID]: 'checkDestinationId',
  [Criterion.INTENT_DESTINATION_ADDRESS]: 'checkIntentDestinationAddress',
  [Criterion.INTENT_DESTINATION_ACCOUNT_TYPE]: 'checkIntentDestinationAccountType',
  [Criterion.INTENT_DESTINATION_CLASSIFICATION]: 'checkDestinationClassification',
  [Criterion.INTENT_CONTRACT]: 'checkIntentContract',
  [Criterion.INTENT_TOKEN]: 'checkIntentToken',
  [Criterion.INTENT_SPENDER]: 'checkIntentSpender',
  [Criterion.INTENT_CHAIN_ID]: 'checkIntentChainId',
  [Criterion.INTENT_HEX_SIGNATURE]: 'checkIntentHexSignature',
  [Criterion.INTENT_AMOUNT]: 'checkIntentAmount',
  [Criterion.INTENT_ERC721_TOKEN_ID]: 'checkERC721TokenId',
  [Criterion.INTENT_ERC1155_TOKEN_ID]: 'checkERC1155TokenId',
  [Criterion.INTENT_ERC1155_TRANSFERS]: 'checkERC1155Transfers',
  [Criterion.INTENT_SIGN_MESSAGE]: 'checkIntentMessage',
  [Criterion.INTENT_SIGN_RAW_PAYLOAD]: 'checkIntentPayload',
  [Criterion.INTENT_SIGN_RAW_PAYLOAD_ALGORITHM]: 'checkIntentAlgorithm',
  [Criterion.INTENT_SIGN_TYPED_DATA_DOMAIN]: 'checkIntentDomain',
  [Criterion.INTENT_PERMIT_DEADLINE]: 'checkPermitDeadline',
  [Criterion.TRANSACTION_REQUEST_GAS_FEES]: 'checkGasFeeAmount',
  [Criterion.TRANSACTION_REQUEST_NONCE_REQUIRED]: 'checkNonceExists',
  [Criterion.TRANSACTION_REQUEST_NONCE_NOT_REQUIRED]: 'checkNonceNotExists',
  [Criterion.APPROVALS]: 'checkApprovals',
  [Criterion.SPENDING_LIMIT]: 'checkSpendingLimit'
}

// const examplePermitPolicy: PolicyCriterionBuilder = {
//   type: Then.PERMIT,
//   name: 'examplePermitPolicy',
//   when: [
//     {
//       criterion: Criterion.ACTION,
//       args: [Action.SIGN_TRANSACTION]
//     },
//     {
//       criterion: Criterion.TRANSACTION_REQUEST_NONCE_REQUIRED
//     },
//     {
//       criterion: Criterion.PRINCIPAL_ID,
//       args: ['matt@narval.xyz']
//     },
//     {
//       criterion: Criterion.WALLET_ID,
//       args: ['eip155:137/0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
//     },
//     {
//       criterion: Criterion.INTENT_TYPE,
//       args: [Intents.TRANSFER_NATIVE]
//     },
//     {
//       criterion: Criterion.INTENT_TOKEN,
//       args: ['eip155:137/slip44:966']
//     },
//     {
//       criterion: Criterion.INTENT_AMOUNT,
//       args: { currency: '*', operator: 'lte', value: '1000000000000000000' }
//     },
//     {
//       criterion: Criterion.APPROVALS,
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

// const exampleForbidPolicy: PolicyCriterionBuilder = {
//   type: Then.FORBID,
//   name: 'exampleForbidPolicy',
//   when: [
//     {
//       criterion: Criterion.ACTION,
//       args: [Action.SIGN_TRANSACTION]
//     },
//     {
//       criterion: Criterion.TRANSACTION_REQUEST_NONCE_REQUIRED
//     },
//     {
//       criterion: Criterion.PRINCIPAL_ID,
//       args: ['matt@narval.xyz']
//     },
//     {
//       criterion: Criterion.WALLET_ID,
//       args: ['eip155:137/0x90d03a8971a2faa19a9d7ffdcbca28fe826a289b']
//     },
//     {
//       criterion: Criterion.INTENT_TYPE,
//       args: [Intents.TRANSFER_NATIVE]
//     },
//     {
//       criterion: Criterion.INTENT_TOKEN,
//       args: ['eip155:137/slip44:966']
//     },
//     {
//       criterion: Criterion.SPENDING_LIMIT,
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
