import { z } from 'zod'
import {
  accountAccountTypeCriterionSchema,
  accountAddressCriterionSchema,
  accountGroupCriterionSchema,
  accountIdCriterionSchema,
  actionCriterionSchema,
  amountConditionSchema,
  approvalConditionSchema,
  approvalsCriterionSchema,
  chainIdCriterionSchema,
  criterionSchema,
  destinationAccountTypeCriterionSchema,
  destinationAddressCriterionSchema,
  destinationClassificationCriterionSchema,
  destinationIdCriterionSchema,
  erc1155AmountConditionSchema,
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
  permitDeadlineConditionSchema,
  permitDeadlineCriterionSchema,
  policyCriterionSchema,
  policySchema,
  principalGroupCriterionSchema,
  principalIdCriterionSchema,
  principalRoleCriterionSchema,
  resourceIntegrityCriterionSchema,
  signMessageConditionSchema,
  signTypedDataDomainConditionSchema,
  spendingLimitConditionSchema,
  spendingLimitCriterionSchema,
  spendingLimitFiltersSchema,
  spendingLimitTimeWindowSchema,
  thenSchema,
  timeWindowSchema
} from '../schema/policy.schema'

export const Then = thenSchema.enum
export type Then = z.infer<typeof thenSchema>

export const Criterion = criterionSchema.enum
export type Criterion = z.infer<typeof criterionSchema>

export const TimeWindow = timeWindowSchema.enum
export type TimeWindow = z.infer<typeof timeWindowSchema>

export type AmountCondition = z.infer<typeof amountConditionSchema>
export type ERC1155AmountCondition = z.infer<typeof erc1155AmountConditionSchema>
export type SignMessageCondition = z.infer<typeof signMessageConditionSchema>
export type SignTypedDataDomainCondition = z.infer<typeof signTypedDataDomainConditionSchema>
export type PermitDeadlineCondition = z.infer<typeof permitDeadlineConditionSchema>
export type ApprovalCondition = z.infer<typeof approvalConditionSchema>
export type SpendingLimitTimeWindow = z.infer<typeof spendingLimitTimeWindowSchema>
export type SpendingLimitFilters = z.infer<typeof spendingLimitFiltersSchema>
export type SpendingLimitCondition = z.infer<typeof spendingLimitConditionSchema>

export type ActionCriterion = z.infer<typeof actionCriterionSchema>
export type ResourceIntegrityCriterion = z.infer<typeof resourceIntegrityCriterionSchema>
export type PrincipalIdCriterion = z.infer<typeof principalIdCriterionSchema>
export type PrincipalRoleCriterion = z.infer<typeof principalRoleCriterionSchema>
export type PrincipalGroupCriterion = z.infer<typeof principalGroupCriterionSchema>
export type AccountIdCriterion = z.infer<typeof accountIdCriterionSchema>
export type AccountAddressCriterion = z.infer<typeof accountAddressCriterionSchema>
export type AccountAccountTypeCriterion = z.infer<typeof accountAccountTypeCriterionSchema>
export type ChainIdCriterion = z.infer<typeof chainIdCriterionSchema>
export type AccountGroupCriterion = z.infer<typeof accountGroupCriterionSchema>
export type IntentTypeCriterion = z.infer<typeof intentTypeCriterionSchema>
export type DestinationIdCriterion = z.infer<typeof destinationIdCriterionSchema>
export type DestinationAddressCriterion = z.infer<typeof destinationAddressCriterionSchema>
export type DestinationAccountTypeCriterion = z.infer<typeof destinationAccountTypeCriterionSchema>
export type DestinationClassificationCriterion = z.infer<typeof destinationClassificationCriterionSchema>
export type IntentContractCriterion = z.infer<typeof intentContractCriterionSchema>
export type IntentTokenCriterion = z.infer<typeof intentTokenCriterionSchema>
export type IntentSpenderCriterion = z.infer<typeof intentSpenderCriterionSchema>
export type IntentChainIdCriterion = z.infer<typeof intentChainIdCriterionSchema>
export type IntentHexSignatureCriterion = z.infer<typeof intentHexSignatureCriterionSchema>
export type IntentAmountCriterion = z.infer<typeof intentAmountCriterionSchema>
export type ERC721TokenIdCriterion = z.infer<typeof erc721TokenIdCriterionSchema>
export type ERC1155TokenIdCriterion = z.infer<typeof erc1155TokenIdCriterionSchema>
export type ERC1155TransfersCriterion = z.infer<typeof erc1155TransfersCriterionSchema>
export type IntentMessageCriterion = z.infer<typeof intentMessageCriterionSchema>
export type IntentPayloadCriterion = z.infer<typeof intentPayloadCriterionSchema>
export type IntentAlgorithmCriterion = z.infer<typeof intentAlgorithmCriterionSchema>
export type IntentDomainCriterion = z.infer<typeof intentDomainCriterionSchema>
export type PermitDeadlineCriterion = z.infer<typeof permitDeadlineCriterionSchema>
export type GasFeeAmountCriterion = z.infer<typeof gasFeeAmountCriterionSchema>
export type NonceRequiredCriterion = z.infer<typeof nonceRequiredCriterionSchema>
export type NonceNotRequiredCriterion = z.infer<typeof nonceNotRequiredCriterionSchema>
export type ApprovalsCriterion = z.infer<typeof approvalsCriterionSchema>
export type SpendingLimitCriterion = z.infer<typeof spendingLimitCriterionSchema>

export type PolicyCriterion = z.infer<typeof policyCriterionSchema>

export type Policy = z.infer<typeof policySchema>
