import { z } from 'zod'
import {
  accountAddressCriterionSchema,
  accountAssignedCriterionSchema,
  accountGroupCriterionSchema,
  accountIdCriterionSchema,
  accountTypeCriterionSchema,
  actionCriterionSchema,
  amountConditionSchema,
  approvalConditionSchema,
  approvalsCriterionSchema,
  criterionSchema,
  destinationAccountTypeCriterionSchema,
  destinationAddressCriterionSchema,
  destinationClassificationCriterionSchema,
  destinationIdCriterionSchema,
  entrypointAccountTypeCriterionSchema,
  entrypointAddressCriterionSchema,
  entrypointClassificationCriterionSchema,
  entrypointIdCriterionSchema,
  erc1155AmountConditionSchema,
  erc1155TokenIdCriterionSchema,
  erc1155TransfersCriterionSchema,
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
  permitDeadlineConditionSchema,
  permitDeadlineCriterionSchema,
  policyCriterionSchema,
  policySchema,
  principalGroupCriterionSchema,
  principalIdCriterionSchema,
  principalRoleCriterionSchema,
  rateLimitConditionSchema,
  rateLimitCriterionSchema,
  resourceCriterionSchema,
  signMessageConditionSchema,
  signTypedDataDomainConditionSchema,
  sourceAccountTypeCriterionSchema,
  sourceAddressCriterionSchema,
  sourceClassificationCriterionSchema,
  sourceIdCriterionSchema,
  spendingLimitConditionSchema,
  spendingLimitCriterionSchema,
  thenSchema,
  timeWindowSchema,
  timeWindowTypeSchema,
  transferFiltersSchema,
  userOperationAccountConditionSchema,
  userOperationIntentsConditionSchema,
  userOperationIntentsCriterionSchema,
  userOperationTransfersConditionSchema
} from '../schema/policy.schema'

export const Then = thenSchema.enum
export type Then = z.infer<typeof thenSchema>

export const Criterion = criterionSchema.enum
export type Criterion = z.infer<typeof criterionSchema>

export const TimeWindowType = timeWindowTypeSchema.enum
export type TimeWindowType = z.infer<typeof timeWindowTypeSchema>

export type AmountCondition = z.infer<typeof amountConditionSchema>
export type ERC1155AmountCondition = z.infer<typeof erc1155AmountConditionSchema>
export type SignMessageCondition = z.infer<typeof signMessageConditionSchema>
export type SignTypedDataDomainCondition = z.infer<typeof signTypedDataDomainConditionSchema>
export type PermitDeadlineCondition = z.infer<typeof permitDeadlineConditionSchema>
export type ApprovalCondition = z.infer<typeof approvalConditionSchema>
export type TimeWindow = z.infer<typeof timeWindowSchema>
export type TransferFilters = z.infer<typeof transferFiltersSchema>
export type SpendingLimitCondition = z.infer<typeof spendingLimitConditionSchema>
export type RateLimitCondition = z.infer<typeof rateLimitConditionSchema>
export type UserOperationAccountCondition = z.infer<typeof userOperationAccountConditionSchema>
export type UserOperationTransfersCondition = z.infer<typeof userOperationTransfersConditionSchema>
export type UserOperationIntentsCondition = z.infer<typeof userOperationIntentsConditionSchema>

// Action
export type ActionCriterion = z.infer<typeof actionCriterionSchema>
// Resource
export type ResourceCriterion = z.infer<typeof resourceCriterionSchema>
// Permission
export type Permission = z.infer<typeof permissionCriterionSchema>
// Principal
export type PrincipalIdCriterion = z.infer<typeof principalIdCriterionSchema>
export type PrincipalRoleCriterion = z.infer<typeof principalRoleCriterionSchema>
export type PrincipalGroupCriterion = z.infer<typeof principalGroupCriterionSchema>
// Resource Account
export type AccountIdCriterion = z.infer<typeof accountIdCriterionSchema>
export type AccountAddressCriterion = z.infer<typeof accountAddressCriterionSchema>
export type AccountAccountTypeCriterion = z.infer<typeof accountTypeCriterionSchema>
export type AccountGroupCriterion = z.infer<typeof accountGroupCriterionSchema>
export type AccountAssignedCriterion = z.infer<typeof accountAssignedCriterionSchema>
// Intent Source Account
export type SourceIdCriterion = z.infer<typeof sourceIdCriterionSchema>
export type SourceAddressCriterion = z.infer<typeof sourceAddressCriterionSchema>
export type SourceAccountTypeCriterion = z.infer<typeof sourceAccountTypeCriterionSchema>
export type SourceClassificationCriterion = z.infer<typeof sourceClassificationCriterionSchema>
// Intent Destination Account
export type DestinationIdCriterion = z.infer<typeof destinationIdCriterionSchema>
export type DestinationAddressCriterion = z.infer<typeof destinationAddressCriterionSchema>
export type DestinationAccountTypeCriterion = z.infer<typeof destinationAccountTypeCriterionSchema>
export type DestinationClassificationCriterion = z.infer<typeof destinationClassificationCriterionSchema>
// Intent
export type IntentTypeCriterion = z.infer<typeof intentTypeCriterionSchema>
export type IntentContractCriterion = z.infer<typeof intentContractCriterionSchema>
export type IntentTokenCriterion = z.infer<typeof intentTokenCriterionSchema>
export type IntentSpenderCriterion = z.infer<typeof intentSpenderCriterionSchema>
export type IntentChainIdCriterion = z.infer<typeof intentChainIdCriterionSchema>
export type IntentHexSignatureCriterion = z.infer<typeof intentHexSignatureCriterionSchema>
export type IntentAmountCriterion = z.infer<typeof intentAmountCriterionSchema>
// Intent Token Transfer
export type ERC1155TokenIdCriterion = z.infer<typeof erc1155TokenIdCriterionSchema>
export type ERC1155TransfersCriterion = z.infer<typeof erc1155TransfersCriterionSchema>
// Intent Sign Message
export type IntentMessageCriterion = z.infer<typeof intentMessageCriterionSchema>
export type IntentPayloadCriterion = z.infer<typeof intentPayloadCriterionSchema>
export type IntentAlgorithmCriterion = z.infer<typeof intentAlgorithmCriterionSchema>
export type IntentDomainCriterion = z.infer<typeof intentDomainCriterionSchema>
// Intent Permit Deadline
export type PermitDeadlineCriterion = z.infer<typeof permitDeadlineCriterionSchema>
// User Operations
export type EntrypointIdCriterion = z.infer<typeof entrypointIdCriterionSchema>
export type EntrypointAddressCriterion = z.infer<typeof entrypointAddressCriterionSchema>
export type EntrypointAccountTypeCriterion = z.infer<typeof entrypointAccountTypeCriterionSchema>
export type EntrypointClassificationCriterion = z.infer<typeof entrypointClassificationCriterionSchema>
export type UserOperationIntentsCriterion = z.infer<typeof userOperationIntentsCriterionSchema>
// Transaction Gas Fee
export type GasFeeAmountCriterion = z.infer<typeof gasFeeAmountCriterionSchema>
// Transaction Nonce
export type NonceRequiredCriterion = z.infer<typeof nonceRequiredCriterionSchema>
export type NonceNotRequiredCriterion = z.infer<typeof nonceNotRequiredCriterionSchema>
// Approvals
export type ApprovalsCriterion = z.infer<typeof approvalsCriterionSchema>
// Limits
export type SpendingLimitCriterion = z.infer<typeof spendingLimitCriterionSchema>
export type RateLimitCriterion = z.infer<typeof rateLimitCriterionSchema>

export type PolicyCriterion = z.infer<typeof policyCriterionSchema>
export type Policy = z.infer<typeof policySchema>
