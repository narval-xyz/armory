import { z } from 'zod'
import {
  accountAddressCriterionSchema,
  accountGroupCriterionSchema,
  accountIdCriterionSchema,
  accountTypeCriterionSchema,
  actionCriterionSchema,
  amountConditionSchema,
  approvalConditionSchema,
  approvalsCriterionSchema,
  beneficiaryCriterionSchema,
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
  erc721TokenIdCriterionSchema,
  fromAccountTypeCriterionSchema,
  fromAddressCriterionSchema,
  fromClassificationCriterionSchema,
  fromIdCriterionSchema,
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
  spendingLimitConditionSchema,
  spendingLimitCriterionSchema,
  thenSchema,
  timeWindowSchema,
  timeWindowTypeSchema,
  transferFiltersSchema,
  userOperationIntentsCriterionSchema
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
// Destination Account
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
export type ERC721TokenIdCriterion = z.infer<typeof erc721TokenIdCriterionSchema>
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
export type FromIdCriterion = z.infer<typeof fromIdCriterionSchema>
export type FromAddressCriterion = z.infer<typeof fromAddressCriterionSchema>
export type FromAccountTypeCriterion = z.infer<typeof fromAccountTypeCriterionSchema>
export type FromClassificationCriterion = z.infer<typeof fromClassificationCriterionSchema>
export type EntrypointIdCriterion = z.infer<typeof entrypointIdCriterionSchema>
export type EntrypointAddressCriterion = z.infer<typeof entrypointAddressCriterionSchema>
export type EntrypointAccountTypeCriterion = z.infer<typeof entrypointAccountTypeCriterionSchema>
export type EntrypointClassificationCriterion = z.infer<typeof entrypointClassificationCriterionSchema>
export type BeneficiaryCriterion = z.infer<typeof beneficiaryCriterionSchema>
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
