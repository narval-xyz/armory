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
  DEPLOY_ERC_4337_ACCOUNT: 'deployErc4337Account',
  DEPLOY_SAFE_ACCOUNT: 'deploySafeAccount',
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
  // Action
  CHECK_ACTION: 'checkAction',

  // Resource
  CHECK_RESOURCE: 'checkResource',

  // Permission
  CHECK_PERMISSION: 'checkPermission',

  // Principal
  CHECK_PRINCIPAL_ID: 'checkPrincipalId',
  CHECK_PRINCIPAL_ROLE: 'checkPrincipalRole',
  CHECK_PRINCIPAL_GROUP: 'checkPrincipalGroup',

  // Resource Account
  CHECK_ACCOUNT_ID: 'checkAccountId',
  CHECK_ACCOUNT_ADDRESS: 'checkAccountAddress',
  CHECK_ACCOUNT_TYPE: 'checkAccountType',
  CHECK_ACCOUNT_CHAIN_ID: 'checkAccountChainId',
  CHECK_ACCOUNT_GROUP: 'checkAccountGroup',

  // Destination Account
  CHECK_DESTINATION_ID: 'checkDestinationId',
  CHECK_DESTINATION_ADDRESS: 'checkDestinationAddress',
  CHECK_DESTINATION_ACCOUNT_TYPE: 'checkDestinationAccountType',
  CHECK_DESTINATION_CLASSIFICATION: 'checkDestinationClassification',

  // Intent
  CHECK_INTENT_TYPE: 'checkIntentType',
  CHECK_INTENT_CHAIN_ID: 'checkIntentChainId',
  CHECK_INTENT_AMOUNT: 'checkIntentAmount',
  CHECK_INTENT_CONTRACT: 'checkIntentContract',
  CHECK_INTENT_SPENDER: 'checkIntentSpender',
  CHECK_INTENT_TOKEN: 'checkIntentToken',
  CHECK_INTENT_HEX_SIGNATURE: 'checkIntentHexSignature',

  // Intent Sign Message
  CHECK_INTENT_MESSAGE: 'checkIntentMessage',
  CHECK_INTENT_PAYLOAD: 'checkIntentPayload',
  CHECK_INTENT_ALGORITHM: 'checkIntentAlgorithm',
  CHECK_INTENT_DOMAIN: 'checkIntentDomain',

  // Intent Token Transfers
  CHECK_ERC721_TOKEN_ID: 'checkERC721TokenId',
  CHECK_ERC1155_TOKEN_ID: 'checkERC1155TokenId',
  CHECK_ERC1155_TRANSFERS: 'checkERC1155Transfers',

  // Intent Permit Deadline
  CHECK_PERMIT_DEADLINE: 'checkPermitDeadline',

  // Intent User Operations
  CHECK_FROM_ID: 'checkFromId',
  CHECK_FROM_ADDRESS: 'checkFromAddress',
  CHECK_FROM_ACCOUNT_TYPE: 'checkFromAccountType',
  CHECK_FROM_CLASSIFICATION: 'checkFromClassification',
  CHECK_ENTRYPOINT_ID: 'checkEntrypointId',
  CHECK_ENTRYPOINT_ADDRESS: 'checkEntrypointAddress',
  CHECK_ENTRYPOINT_ACCOUNT_TYPE: 'checkEntrypointAccountType',
  CHECK_ENTRYPOINT_CLASSIFICATION: 'checkEntrypointClassification',
  CHECK_BENEFICIARY: 'checkBeneficiary',
  CHECK_USER_OPERATION_INTENTS: 'checkUserOperationIntents',

  // Transaction Gas Fee
  CHECK_GAS_FEE_AMOUNT: 'checkGasFeeAmount',

  // Transaction Nonce
  CHECK_NONCE_EXISTS: 'checkNonceExists',
  CHECK_NONCE_NOT_EXISTS: 'checkNonceNotExists',

  // Approvals
  CHECK_APPROVALS: 'checkApprovals',

  // Limits
  CHECK_SPENDING_LIMIT: 'checkSpendingLimit',
  CHECK_RATE_LIMIT: 'checkRateLimit'
} as const)

export const timeWindowTypeSchema = z.nativeEnum({
  ROLLING: 'rolling',
  FIXED: 'fixed'
} as const)

export const timeWindowPeriodSchema = z.nativeEnum({
  DAYLY: '1d',
  MONTHLY: '1m',
  YEARLY: '1y'
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

export const timeWindowSchema = z.object({
  type: timeWindowTypeSchema.optional(),
  period: timeWindowPeriodSchema.optional(),
  value: z.number().optional(),
  startDate: z.number().int().optional(),
  endDate: z.number().int().optional()
})

export const transferFiltersSchema = z.object({
  tokens: z.array(z.string()).min(1).optional(),
  users: z.array(z.string().min(1)).min(1).optional(),
  resources: z.array(z.string().min(1)).min(1).optional(),
  destinations: z.array(AccountId).min(1).optional(),
  chains: z.array(z.string().min(1)).min(1).optional(),
  userGroups: z.array(z.string().min(1)).min(1).optional(),
  accountGroups: z.array(z.string().min(1)).min(1).optional()
})

export const spendingLimitConditionSchema = z.object({
  limit: z.string().min(1),
  operator: z.nativeEnum(ValueOperators),
  currency: z.nativeEnum(FiatCurrency).optional(),
  timeWindow: timeWindowSchema.optional(),
  filters: transferFiltersSchema.optional()
})

export const rateLimitConditionSchema = z.object({
  limit: z.number(),
  timeWindow: timeWindowSchema.optional(),
  filters: transferFiltersSchema.optional()
})

// Action
export const actionCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ACTION),
  args: z.array(z.nativeEnum(Action)).min(1)
})

// Resource
export const resourceCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_RESOURCE),
  args: z.array(z.string()).min(1)
})

// Permission
export const permissionCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_PERMISSION),
  args: z.array(z.string()).min(1)
})

// Principal
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

// Resource Account
export const accountIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ACCOUNT_ID),
  args: z.array(z.string().min(1)).min(1)
})

export const accountAddressCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ACCOUNT_ADDRESS),
  args: z.array(z.string().min(1)).min(1)
})

export const accountTypeCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ACCOUNT_TYPE),
  args: z.array(z.nativeEnum(AccountType)).min(1)
})

export const accountGroupCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ACCOUNT_GROUP),
  args: z.array(z.string().min(1)).min(1)
})

// Destination Account
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

// Intent
export const intentTypeCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_INTENT_TYPE),
  args: z.array(intentSchema).min(1)
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

// Intent Token Transfer
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

// Intent Sign Message
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

// Intent Permit Deadline
export const permitDeadlineCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_PERMIT_DEADLINE),
  args: permitDeadlineConditionSchema
})

// User Operations
export const fromIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_FROM_ID),
  args: z.array(AccountId).min(1)
})

export const fromAddressCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_FROM_ADDRESS),
  args: z.array(z.string().min(1)).min(1)
})

export const fromAccountTypeCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_FROM_ACCOUNT_TYPE),
  args: z.array(z.nativeEnum(AccountType)).min(1)
})

export const fromClassificationCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_FROM_CLASSIFICATION),
  args: z.array(z.string().min(1)).min(1)
})

export const entrypointIdCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ENTRYPOINT_ID),
  args: z.array(AccountId).min(1)
})

export const entrypointAddressCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ENTRYPOINT_ADDRESS),
  args: z.array(z.string().min(1)).min(1)
})

export const entrypointAccountTypeCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ENTRYPOINT_ACCOUNT_TYPE),
  args: z.array(z.nativeEnum(AccountType)).min(1)
})

export const entrypointClassificationCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_ENTRYPOINT_CLASSIFICATION),
  args: z.array(z.string().min(1)).min(1)
})

export const beneficiaryCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_BENEFICIARY),
  args: z.array(z.string().min(1)).min(1)
})

export const userOperationIntentsCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_USER_OPERATION_INTENTS),
  args: z.array(intentSchema).min(1)
})

// Transaction Gas Fee
export const gasFeeAmountCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_GAS_FEE_AMOUNT),
  args: amountConditionSchema
})

// Transaction Nonce
export const nonceRequiredCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_NONCE_EXISTS),
  args: z.null()
})

export const nonceNotRequiredCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_NONCE_NOT_EXISTS),
  args: z.null()
})

// Approvals
export const approvalsCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_APPROVALS),
  args: z.array(approvalConditionSchema).min(1)
})

// Limits
export const spendingLimitCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_SPENDING_LIMIT),
  args: spendingLimitConditionSchema
})

export const rateLimitCriterionSchema = z.object({
  criterion: z.literal(criterionSchema.enum.CHECK_RATE_LIMIT),
  args: rateLimitConditionSchema
})

export const policyCriterionSchema = z.discriminatedUnion('criterion', [
  // Action
  actionCriterionSchema,
  // Resource
  resourceCriterionSchema,
  // Permission
  permissionCriterionSchema,
  // Principal
  principalIdCriterionSchema,
  principalRoleCriterionSchema,
  principalGroupCriterionSchema,
  // Resource Account
  accountIdCriterionSchema,
  accountAddressCriterionSchema,
  accountTypeCriterionSchema,
  accountGroupCriterionSchema,
  // Destination Account
  destinationIdCriterionSchema,
  destinationAddressCriterionSchema,
  destinationAccountTypeCriterionSchema,
  destinationClassificationCriterionSchema,
  // Intent
  intentAmountCriterionSchema,
  intentChainIdCriterionSchema,
  intentContractCriterionSchema,
  intentHexSignatureCriterionSchema,
  intentSpenderCriterionSchema,
  intentTokenCriterionSchema,
  intentTypeCriterionSchema,
  // Intent Token Transfer
  erc1155TokenIdCriterionSchema,
  erc1155TransfersCriterionSchema,
  erc721TokenIdCriterionSchema,
  // Intent Sign Message
  intentAlgorithmCriterionSchema,
  intentDomainCriterionSchema,
  intentMessageCriterionSchema,
  intentPayloadCriterionSchema,
  // Intent Permit Deadline
  permitDeadlineCriterionSchema,
  // User Operations
  fromIdCriterionSchema,
  fromAddressCriterionSchema,
  fromAccountTypeCriterionSchema,
  fromClassificationCriterionSchema,
  entrypointIdCriterionSchema,
  entrypointAddressCriterionSchema,
  entrypointAccountTypeCriterionSchema,
  entrypointClassificationCriterionSchema,
  beneficiaryCriterionSchema,
  userOperationIntentsCriterionSchema,
  // Transaction Gas Fee
  gasFeeAmountCriterionSchema,
  // Transaction Nonce
  nonceNotRequiredCriterionSchema,
  nonceRequiredCriterionSchema,
  // Approvals
  approvalsCriterionSchema,
  // Limits
  spendingLimitCriterionSchema,
  rateLimitCriterionSchema
])

export const policySchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  when: z.array(policyCriterionSchema).min(1),
  then: thenSchema
})
