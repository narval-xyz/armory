import {
  AccountId,
  AccountType,
  Action,
  Address,
  Alg,
  AssetId,
  EntityType,
  FiatCurrency,
  Hex,
  IdentityOperators,
  ValueOperators
} from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'

export const Then = {
  PERMIT: 'permit',
  FORBID: 'forbid'
} as const

export type Then = (typeof Then)[keyof typeof Then]

export const Criterion = {
  CHECK_ACTION: 'checkAction',
  CHECK_RESOURCE_INTEGRITY: 'checkResourceIntegrity',
  CHECK_PRINCIPAL_ID: 'checkPrincipalId',
  CHECK_PRINCIPAL_ROLE: 'checkPrincipalRole',
  CHECK_PRINCIPAL_GROUP: 'checkPrincipalGroup',
  CHECK_WALLET_ID: 'checkWalletId',
  CHECK_WALLET_ADDRESS: 'checkWalletAddress',
  CHECK_WALLET_ACCOUNT_TYPE: 'checkWalletAccountType',
  CHECK_WALLET_CHAIN_ID: 'checkWalletChainId',
  CHECK_WALLET_GROUP: 'checkWalletGroup',
  CHECK_INTENT_TYPE: 'checkIntentType',
  CHECK_DESTINATION_ID: 'checkDestinationId',
  CHECK_DESTINATION_ADDRESS: 'checkDestinationAddress',
  CHECK_DESTINATION_ACCOUNT_TYPE: 'checkDestinationAccountType',
  CHECK_DESTINATION_CLASSIFICATION: 'checkDestinationClassification',
  CHECK_INTENT_CONTRACT: 'checkIntentContract',
  CHECK_INTENT_TOKEN: 'checkIntentToken',
  CHECK_INTENT_SPENDER: 'checkIntentSpender',
  CHECK_INTENT_CHAIN_ID: 'checkIntentChainId',
  CHECK_INTENT_HEX_SIGNATURE: 'checkIntentHexSignature',
  CHECK_INTENT_AMOUNT: 'checkIntentAmount',
  CHECK_ERC721_TOKEN_ID: 'checkERC721TokenId',
  CHECK_ERC1155_TOKEN_ID: 'checkERC1155TokenId',
  CHECK_ERC1155_TRANSFERS: 'checkERC1155Transfers',
  CHECK_INTENT_MESSAGE: 'checkIntentMessage',
  CHECK_INTENT_PAYLOAD: 'checkIntentPayload',
  CHECK_INTENT_ALGORITHM: 'checkIntentAlgorithm',
  CHECK_INTENT_DOMAIN: 'checkIntentDomain',
  CHECK_PERMIT_DEADLINE: 'checkPermitDeadline',
  CHECK_GAS_FEE_AMOUNT: 'checkGasFeeAmount',
  CHECK_NONCE_EXISTS: 'checkNonceExists',
  CHECK_NONCE_NOT_EXISTS: 'checkNonceNotExists',
  CHECK_APPROVALS: 'checkApprovals',
  CHECK_SPENDING_LIMIT: 'checkSpendingLimit'
} as const

export type Criterion = (typeof Criterion)[keyof typeof Criterion]

type AmountCondition = {
  currency: `${FiatCurrency}` | '*'
  operator: `${ValueOperators}`
  value: string
}

type ERC1155AmountCondition = {
  tokenId: AssetId
  operator: `${ValueOperators}`
  value: string
}

type SignMessageCondition = {
  operator: `${ValueOperators.EQUAL}` | `${typeof IdentityOperators.CONTAINS}`
  value: string
}

type SignTypedDataDomainCondition = {
  version?: string[]
  chainId?: string[]
  name?: string[]
  verifyingContract?: Address[]
}

type PermitDeadlineCondition = {
  operator: `${ValueOperators}`
  value: string // timestamp in ms
}

type ApprovalCondition = {
  approvalCount: number
  countPrincipal: boolean
  approvalEntityType: `${EntityType}`
  entityIds: string[]
}

type SpendingLimitCondition = {
  limit: string
  currency?: `${FiatCurrency}`
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
  criterion: typeof Criterion.CHECK_ACTION
  args: Action[]
}

type ResourceIntegrityCriterion = {
  criterion: typeof Criterion.CHECK_RESOURCE_INTEGRITY
  args: null
}

type PrincipalIdCriterion = {
  criterion: typeof Criterion.CHECK_PRINCIPAL_ID
  args: string[]
}

type PrincipalRoleCriterion = {
  criterion: typeof Criterion.CHECK_PRINCIPAL_ROLE
  args: string[]
}

type PrincipalGroupCriterion = {
  criterion: typeof Criterion.CHECK_PRINCIPAL_GROUP
  args: string[]
}

type WalletIdCriterion = {
  criterion: typeof Criterion.CHECK_WALLET_ID
  args: string[]
}

type WalletAddressCriterion = {
  criterion: typeof Criterion.CHECK_WALLET_ADDRESS
  args: string[]
}

type WalletAccountTypeCriterion = {
  criterion: typeof Criterion.CHECK_WALLET_ACCOUNT_TYPE
  args: AccountType[]
}

type WalletChainIdCriterion = {
  criterion: typeof Criterion.CHECK_WALLET_CHAIN_ID
  args: string[]
}

type WalletGroupCriterion = {
  criterion: typeof Criterion.CHECK_WALLET_GROUP
  args: string[]
}

type IntentTypeCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_TYPE
  args: Intents[]
}

type DestinationIdCriterion = {
  criterion: typeof Criterion.CHECK_DESTINATION_ID
  args: AccountId[]
}

type DestinationAddressCriterion = {
  criterion: typeof Criterion.CHECK_DESTINATION_ADDRESS
  args: string[]
}

type DestinationAccountTypeCriterion = {
  criterion: typeof Criterion.CHECK_DESTINATION_ACCOUNT_TYPE
  args: AccountType[]
}

type DestinationClassificationCriterion = {
  criterion: typeof Criterion.CHECK_DESTINATION_CLASSIFICATION
  args: string[]
}

type IntentContractCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_CONTRACT
  args: AccountId[]
}

type IntentTokenCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_TOKEN
  args: AccountId[]
}

type IntentSpenderCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_SPENDER
  args: AccountId[]
}

type IntentChainIdCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_CHAIN_ID
  args: string[]
}

type IntentHexSignatureCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_HEX_SIGNATURE
  args: Hex[]
}

type IntentAmountCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_AMOUNT
  args: AmountCondition
}

type ERC721TokenIdCriterion = {
  criterion: typeof Criterion.CHECK_ERC721_TOKEN_ID
  args: AssetId[]
}

type ERC1155TokenIdCriterion = {
  criterion: typeof Criterion.CHECK_ERC1155_TOKEN_ID
  args: AssetId[]
}

type ERC1155TransfersCriterion = {
  criterion: typeof Criterion.CHECK_ERC1155_TRANSFERS
  args: ERC1155AmountCondition[]
}

type IntentMessageCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_MESSAGE
  args: SignMessageCondition
}

type IntentPayloadCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_PAYLOAD
  args: string[]
}

type IntentAlgorithmCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_ALGORITHM
  args: Alg[]
}

type IntentDomainCriterion = {
  criterion: typeof Criterion.CHECK_INTENT_DOMAIN
  args: SignTypedDataDomainCondition
}

type PermitDeadlineCriterion = {
  criterion: typeof Criterion.CHECK_PERMIT_DEADLINE
  args: PermitDeadlineCondition
}

type GasFeeAmountCriterion = {
  criterion: typeof Criterion.CHECK_GAS_FEE_AMOUNT
  args: AmountCondition
}

type NonceRequiredCriterion = {
  criterion: typeof Criterion.CHECK_NONCE_EXISTS
  args: null
}

type NonceNotRequiredCriterion = {
  criterion: typeof Criterion.CHECK_NONCE_NOT_EXISTS
  args: null
}

type ApprovalsCriterion = {
  criterion: typeof Criterion.CHECK_APPROVALS
  args: ApprovalCondition[]
}

type SpendingLimitCriterion = {
  criterion: typeof Criterion.CHECK_SPENDING_LIMIT
  args: SpendingLimitCondition
}

export type PolicyCriterion =
  | ActionCriterion
  | ResourceIntegrityCriterion
  | PrincipalIdCriterion
  | PrincipalRoleCriterion
  | PrincipalGroupCriterion
  | WalletIdCriterion
  | WalletAddressCriterion
  | WalletAccountTypeCriterion
  | WalletChainIdCriterion
  | WalletGroupCriterion
  | IntentTypeCriterion
  | DestinationIdCriterion
  | DestinationAddressCriterion
  | DestinationAccountTypeCriterion
  | DestinationClassificationCriterion
  | IntentContractCriterion
  | IntentTokenCriterion
  | IntentSpenderCriterion
  | IntentChainIdCriterion
  | IntentHexSignatureCriterion
  | IntentAmountCriterion
  | ERC721TokenIdCriterion
  | ERC1155TokenIdCriterion
  | ERC1155TransfersCriterion
  | IntentMessageCriterion
  | IntentPayloadCriterion
  | IntentAlgorithmCriterion
  | IntentDomainCriterion
  | PermitDeadlineCriterion
  | GasFeeAmountCriterion
  | NonceRequiredCriterion
  | NonceNotRequiredCriterion
  | ApprovalsCriterion
  | SpendingLimitCriterion

export type PolicyCriterionBuilder = {
  name: string
  when: PolicyCriterion[]
  then: Then
}
