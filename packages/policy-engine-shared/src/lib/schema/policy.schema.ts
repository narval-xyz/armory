import { Alg } from '@narval/signature'
import { z } from 'zod'
import { Action } from '../type/action.type'
import { EntityType, FiatCurrency, IdentityOperators, ValueOperators } from '../type/domain.type'
import { AccountType, UserRole } from '../type/entity.type'
import { AccountId } from '../util/caip.util'
import { addressSchema } from './address.schema'
import { hexSchema } from './hex.schema'

// TODO: (@wcalderipe, 07/03/24): duplicate Intents enum from
// transaction-request-intent due to a circular dependency between the two
// packages.
const intentSchema = z.nativeEnum({
  TRANSFER_NATIVE: 'transferNative',
  TRANSFER_ERC20: 'transferErc20',
  TRANSFER_ERC721: 'transferErc721',
  TRANSFER_ERC1155: 'transferErc1155',
  APPROVE_TOKEN_ALLOWANCE: 'approveTokenAllowance',
  PERMIT: 'permit',
  PERMIT2: 'permit2',
  CALL_CONTRACT: 'callContract',
  RETRY_TRANSACTION: 'retryTransaction',
  CANCEL_TRANSACTION: 'cancelTransaction',
  DEPLOY_CONTRACT: 'deployContract',
  DEPLOY_ERC_4337_WALLET: 'deployErc4337Wallet',
  DEPLOY_SAFE_WALLET: 'deploySafeWallet',
  SIGN_MESSAGE: 'signMessage',
  SIGN_RAW: 'signRaw',
  SIGN_TYPED_DATA: 'signTypedData',
  USER_OPERATION: 'userOperation'
} as const)

export const thenSchema = z.nativeEnum({
  PERMIT: 'permit',
  FORBID: 'forbid'
} as const)

export const criterionSchema = z.nativeEnum({
  CHECK_ACTION: 'checkAction',
  CHECK_RESOURCE: 'checkResource',
  CHECK_PERMISSION: 'checkPermission',
  CHECK_RESOURCE_INTEGRITY: 'checkResourceIntegrity',
  CHECK_PRINCIPAL_ID: 'checkPrincipalId',
  CHECK_PRINCIPAL_ROLE: 'checkPrincipalRole',
  CHECK_PRINCIPAL_GROUP: 'checkPrincipalGroup',
  CHECK_WALLET_ID: 'checkWalletId',
  CHECK_WALLET_ADDRESS: 'checkWalletAddress',
  CHECK_WALLET_ACCOUNT_TYPE: 'checkWalletAccountType',
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
  CHECK_CHAIN_ID: 'checkChainId',
  CHECK_GAS_FEE_AMOUNT: 'checkGasFeeAmount',
  CHECK_NONCE_EXISTS: 'checkNonceExists',
  CHECK_NONCE_NOT_EXISTS: 'checkNonceNotExists',
  CHECK_APPROVALS: 'checkApprovals',
  CHECK_SPENDING_LIMIT: 'checkSpendingLimit'
} as const)

export const timeWindowSchema = z.nativeEnum({
  ROLLING: 'rolling',
  FIXED: 'fixed'
} as const)

export const amountConditionSchema = z.object({
  currency: z.union([z.nativeEnum(FiatCurrency), z.literal('*')]),
  operator: z.nativeEnum(ValueOperators),
  value: z.string()
})

export const erc1155AmountConditionSchema = z.object({
  tokenId: z.string(),
  operator: z.nativeEnum(ValueOperators),
  value: z.string()
})

export const signMessageConditionSchema = z.object({
  operator: z.union([z.literal(ValueOperators.EQUAL), z.literal(IdentityOperators.CONTAINS)]),
  value: z.string().min(1)
})

export const signTypedDataDomainConditionSchema = z.object({
  version: z.array(z.string()).min(1).optional(),
  chainId: z.array(z.string()).min(1).optional(),
  name: z.array(z.string()).min(1).optional(),
  verifyingContract: z.array(addressSchema).min(1).optional()
})

export const permitDeadlineConditionSchema = z.object({
  operator: z.nativeEnum(ValueOperators),
  value: z.string().min(1)
})

export const approvalConditionSchema = z.object({
  approvalCount: z.number().int(),
  countPrincipal: z.boolean(),
  approvalEntityType: z.nativeEnum(EntityType),
  entityIds: z.array(z.string().min(1))
})

export const spendingLimitTimeWindowSchema = z.object({
  type: timeWindowSchema.optional(),
  value: z.number().optional(),
  startDate: z.number().int().optional(),
  endDate: z.number().int().optional()
})

export const spendingLimitFiltersSchema = z.object({
  tokens: z.array(z.string()).min(1).optional(),
  users: z.array(z.string().min(1)).min(1).optional(),
  resources: z.array(AccountId).min(1).optional(),
  chains: z.array(z.string().min(1)).min(1).optional(),
  userGroups: z.array(z.string().min(1)).min(1).optional(),
  walletGroups: z.array(z.string().min(1)).min(1).optional()
})

export const spendingLimitConditionSchema = z.object({
  limit: z.string().min(1),
  operator: z.nativeEnum(ValueOperators),
  currency: z.nativeEnum(FiatCurrency).optional(),
  timeWindow: spendingLimitTimeWindowSchema.optional(),
  filters: spendingLimitFiltersSchema.optional()
})

export const actionCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ACTION),
  args: z.array(z.nativeEnum(Action)).min(1)
})

export const resourceCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_RESOURCE),
  args: z.array(z.string()).min(1)
})

export const permissionCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_PERMISSION),
  args: z.array(z.string()).min(1)
})

export const resourceIntegrityCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_RESOURCE_INTEGRITY),
  args: z.null()
})

export const principalIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_PRINCIPAL_ID),
  args: z.array(z.string().min(1)).min(1)
})

export const principalRoleCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_PRINCIPAL_ROLE),
  args: z.array(z.nativeEnum(UserRole)).min(1)
})

export const principalGroupCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_PRINCIPAL_GROUP),
  args: z.array(z.string().min(1)).min(1)
})

export const walletIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_WALLET_ID),
  args: z.array(z.string().min(1)).min(1)
})

export const walletAddressCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_WALLET_ADDRESS),
  args: z.array(z.string().min(1)).min(1)
})

export const walletAccountTypeCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_WALLET_ACCOUNT_TYPE),
  args: z.array(z.nativeEnum(AccountType)).min(1)
})

export const chainIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_CHAIN_ID),
  args: z.array(z.string().min(1)).min(1)
})

export const walletGroupCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_WALLET_GROUP),
  args: z.array(z.string().min(1)).min(1)
})

export const intentTypeCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_TYPE),
  args: z.array(intentSchema).min(1)
})

export const destinationIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_DESTINATION_ID),
  args: z.array(AccountId).min(1)
})

export const destinationAddressCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_DESTINATION_ADDRESS),
  args: z.array(z.string().min(1)).min(1)
})

export const destinationAccountTypeCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_DESTINATION_ACCOUNT_TYPE),
  args: z.array(z.nativeEnum(AccountType)).min(1)
})

export const destinationClassificationCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_DESTINATION_CLASSIFICATION),
  args: z.array(z.string().min(1)).min(1)
})

export const intentContractCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_CONTRACT),
  args: z.array(AccountId).min(1)
})

export const intentTokenCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_TOKEN),
  args: z.array(z.string()).min(1)
})

export const intentSpenderCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_SPENDER),
  args: z.array(AccountId).min(1)
})

export const intentChainIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_CHAIN_ID),
  args: z.array(z.string().min(1)).min(1)
})

export const intentHexSignatureCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_HEX_SIGNATURE),
  args: z.array(hexSchema).min(1)
})

export const intentAmountCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_AMOUNT),
  args: amountConditionSchema
})

export const erc721TokenIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ERC721_TOKEN_ID),
  args: z.array(z.string()).min(1)
})

export const erc1155TokenIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ERC1155_TOKEN_ID),
  args: z.array(z.string()).min(1)
})

export const erc1155TransfersCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ERC1155_TRANSFERS),
  args: z.array(erc1155AmountConditionSchema).min(1)
})

export const intentMessageCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_MESSAGE),
  args: signMessageConditionSchema
})

export const intentPayloadCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_PAYLOAD),
  args: z.array(z.string().min(1)).min(1)
})

export const intentAlgorithmCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_ALGORITHM),
  args: z.array(z.nativeEnum(Alg)).min(1)
})

export const intentDomainCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_DOMAIN),
  args: signTypedDataDomainConditionSchema
})

export const permitDeadlineCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_PERMIT_DEADLINE),
  args: permitDeadlineConditionSchema
})

export const gasFeeAmountCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_GAS_FEE_AMOUNT),
  args: amountConditionSchema
})

export const nonceRequiredCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_NONCE_EXISTS),
  args: z.null()
})

export const nonceNotRequiredCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_NONCE_NOT_EXISTS),
  args: z.null()
})

export const approvalsCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_APPROVALS),
  args: z.array(approvalConditionSchema).min(1)
})

export const spendingLimitCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_SPENDING_LIMIT),
  args: spendingLimitConditionSchema
})

export const policyCriterionSchema = z.discriminatedUnion('criterion', [
  actionCriterionSchema,
  approvalsCriterionSchema,
  chainIdCriterionSchema,
  destinationAccountTypeCriterionSchema,
  destinationAddressCriterionSchema,
  destinationClassificationCriterionSchema,
  destinationIdCriterionSchema,
  erc1155TokenIdCriterionSchema,
  erc1155TransfersCriterionSchema,
  erc721TokenIdCriterionSchema,
  gasFeeAmountCriterionSchema,
  intentAlgorithmCriterionSchema,
  intentAmountCriterionSchema,
  intentChainIdCriterionSchema,
  intentContractCriterionSchema,
  intentDomainCriterionSchema,
  intentHexSignatureCriterionSchema,
  intentMessageCriterionSchema,
  intentPayloadCriterionSchema,
  intentSpenderCriterionSchema,
  intentTokenCriterionSchema,
  intentTypeCriterionSchema,
  nonceNotRequiredCriterionSchema,
  nonceRequiredCriterionSchema,
  permissionCriterionSchema,
  permitDeadlineCriterionSchema,
  principalGroupCriterionSchema,
  principalIdCriterionSchema,
  principalRoleCriterionSchema,
  resourceCriterionSchema,
  resourceIntegrityCriterionSchema,
  spendingLimitCriterionSchema,
  walletAccountTypeCriterionSchema,
  walletAddressCriterionSchema,
  walletGroupCriterionSchema,
  walletIdCriterionSchema
])

export const policySchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  when: z.array(policyCriterionSchema).min(1),
  then: thenSchema
})
