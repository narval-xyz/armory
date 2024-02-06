import { AccountId, AccountType, Action, Address, Alg, AssetId, Hex } from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'

export enum Then {
  PERMIT = 'permit',
  FORBID = 'forbid'
}

export enum Criterion {
  CHECK_ACTION = 'checkAction',
  CHECK_TRANSFER_RESOURCE_INTEGRITY = 'checkTransferResourceIntegrity',
  CHECK_PRINCIPAL_ID = 'checkPrincipalId',
  CHECK_PRINCIPAL_ROLE = 'checkPrincipalRole',
  CHECK_PRINCIPAL_GROUP = 'checkPrincipalGroup',
  CHECK_WALLET_ID = 'checkWalletId',
  CHECK_WALLET_ADDRESS = 'checkWalletAddress',
  CHECK_WALLET_ACCOUNT_TYPE = 'checkWalletAccountType',
  CHECK_WALLET_CHAIN_ID = 'checkWalletChainId',
  CHECK_WALLET_GROUP = 'checkWalletGroup',
  CHECK_INTENT_TYPE = 'checkIntentType',
  CHECK_DESTINATION_ID = 'checkDestinationId',
  CHECK_DESTINATION_ADDRESS = 'checkDestinationAddress',
  CHECK_DESTINATION_ACCOUNT_TYPE = 'checkDestinationAccountType',
  CHECK_DESTINATION_CLASSIFICATION = 'checkDestinationClassification',
  CHECK_INTENT_CONTRACT = 'checkIntentContract',
  CHECK_INTENT_TOKEN = 'checkIntentToken',
  CHECK_INTENT_SPENDER = 'checkIntentSpender',
  CHECK_INTENT_CHAIN_ID = 'checkIntentChainId',
  CHECK_INTENT_HEX_SIGNATURE = 'checkIntentHexSignature',
  CHECK_INTENT_AMOUNT = 'checkIntentAmount',
  CHECK_ERC721_TOKEN_ID = 'checkERC721TokenId',
  CHECK_ERC1155_TOKEN_ID = 'checkERC1155TokenId',
  CHECK_ERC1155_TRANSFERS = 'checkERC1155Transfers',
  CHECK_INTENT_MESSAGE = 'checkIntentMessage',
  CHECK_INTENT_PAYLOAD = 'checkIntentPayload',
  CHECK_INTENT_ALGORITHM = 'checkIntentAlgorithm',
  CHECK_INTENT_DOMAIN = 'checkIntentDomain',
  CHECK_PERMIT_DEADLINE = 'checkPermitDeadline',
  CHECK_GAS_FEE_AMOUNT = 'checkGasFeeAmount',
  CHECK_NONCE_EXISTS = 'checkNonceExists',
  CHECK_NONCE_NOT_EXISTS = 'checkNonceNotExists',
  CHECK_APPROVALS = 'checkApprovals',
  CHECK_SPENDING_LIMIT = 'checkSpendingLimit'
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
  criterion: Criterion.CHECK_ACTION
  args: Action[]
}

type TransferResourceIntegrityCriterion = {
  criterion: Criterion.CHECK_TRANSFER_RESOURCE_INTEGRITY
  args: null
}

type PrincipalIdCriterion = {
  criterion: Criterion.CHECK_PRINCIPAL_ID
  args: string[]
}

type PrincipalRoleCriterion = {
  criterion: Criterion.CHECK_PRINCIPAL_ROLE
  args: string[]
}

type PrincipalGroupCriterion = {
  criterion: Criterion.CHECK_PRINCIPAL_GROUP
  args: string[]
}

type WalletIdCriterion = {
  criterion: Criterion.CHECK_WALLET_ID
  args: string[]
}

type WalletAddressCriterion = {
  criterion: Criterion.CHECK_WALLET_ADDRESS
  args: string[]
}

type WalletAccountTypeCriterion = {
  criterion: Criterion.CHECK_WALLET_ACCOUNT_TYPE
  args: AccountType[]
}

type WalletChainIdCriterion = {
  criterion: Criterion.CHECK_WALLET_CHAIN_ID
  args: string[]
}

type WalletGroupCriterion = {
  criterion: Criterion.CHECK_WALLET_GROUP
  args: string[]
}

type IntentTypeCriterion = {
  criterion: Criterion.CHECK_INTENT_TYPE
  args: Intents[]
}

type DestinationIdCriterion = {
  criterion: Criterion.CHECK_DESTINATION_ID
  args: AccountId[]
}

type DestinationAddressCriterion = {
  criterion: Criterion.CHECK_DESTINATION_ADDRESS
  args: string[]
}

type DestinationAccountTypeCriterion = {
  criterion: Criterion.CHECK_DESTINATION_ACCOUNT_TYPE
  args: AccountType[]
}

type DestinationClassificationCriterion = {
  criterion: Criterion.CHECK_DESTINATION_CLASSIFICATION
  args: string[]
}

type IntentContractCriterion = {
  criterion: Criterion.CHECK_INTENT_CONTRACT
  args: AccountId[]
}

type IntentTokenCriterion = {
  criterion: Criterion.CHECK_INTENT_TOKEN
  args: AccountId[]
}

type IntentSpenderCriterion = {
  criterion: Criterion.CHECK_INTENT_SPENDER
  args: AccountId[]
}

type IntentChainIdCriterion = {
  criterion: Criterion.CHECK_INTENT_CHAIN_ID
  args: string[]
}

type IntentHexSignatureCriterion = {
  criterion: Criterion.CHECK_INTENT_HEX_SIGNATURE
  args: Hex[]
}

type IntentAmountCriterion = {
  criterion: Criterion.CHECK_INTENT_AMOUNT
  args: AmountCondition
}

type ERC721TokenIdCriterion = {
  criterion: Criterion.CHECK_ERC721_TOKEN_ID
  args: AssetId[]
}

type ERC1155TokenIdCriterion = {
  criterion: Criterion.CHECK_ERC1155_TOKEN_ID
  args: AssetId[]
}

type ERC1155TransfersCriterion = {
  criterion: Criterion.CHECK_ERC1155_TRANSFERS
  args: ERC1155AmountCondition[]
}

type IntentMessageCriterion = {
  criterion: Criterion.CHECK_INTENT_MESSAGE
  args: SignMessageCondition
}

type IntentPayloadCriterion = {
  criterion: Criterion.CHECK_INTENT_PAYLOAD
  args: string[]
}

type IntentAlgorithmCriterion = {
  criterion: Criterion.CHECK_INTENT_ALGORITHM
  args: Alg[]
}

type IntentDomainCriterion = {
  criterion: Criterion.CHECK_INTENT_DOMAIN
  args: SignTypedDataDomainCondition
}

type PermitDeadlineCriterion = {
  criterion: Criterion.CHECK_PERMIT_DEADLINE
  args: PermitDeadlineCondition
}

type GasFeeAmountCriterion = {
  criterion: Criterion.CHECK_GAS_FEE_AMOUNT
  args: AmountCondition
}

type NonceRequiredCriterion = {
  criterion: Criterion.CHECK_NONCE_EXISTS
  args: null
}

type NonceNotRequiredCriterion = {
  criterion: Criterion.CHECK_NONCE_NOT_EXISTS
  args: null
}

type ApprovalsCriterion = {
  criterion: Criterion.CHECK_APPROVALS
  args: ApprovalCondition[]
}

type SpendingLimitCriterion = {
  criterion: Criterion.CHECK_SPENDING_LIMIT
  args: SpendingLimitCondition
}

export type PolicyCriterion =
  | ActionCriterion
  | TransferResourceIntegrityCriterion
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
  then: Then
  when: PolicyCriterion[]
}
