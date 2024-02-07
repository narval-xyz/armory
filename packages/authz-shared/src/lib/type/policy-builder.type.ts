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
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, IsIn, IsString } from 'class-validator'

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

export type AmountCondition = {
  currency: `${FiatCurrency}` | '*'
  operator: `${ValueOperators}`
  value: string
}

export type ERC1155AmountCondition = {
  tokenId: AssetId
  operator: `${ValueOperators}`
  value: string
}

export type SignMessageCondition = {
  operator: `${ValueOperators.EQUAL}` | `${typeof IdentityOperators.CONTAINS}`
  value: string
}

export type SignTypedDataDomainCondition = {
  version?: string[]
  chainId?: string[]
  name?: string[]
  verifyingContract?: Address[]
}

export type PermitDeadlineCondition = {
  operator: `${ValueOperators}`
  value: string // timestamp in ms
}

export type ApprovalCondition = {
  approvalCount: number
  countPrincipal: boolean
  approvalEntityType: `${EntityType}`
  entityIds: string[]
}

export type SpendingLimitCondition = {
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

class BaseCriterion {
  criterion: Criterion
}

class ActionCriterion extends BaseCriterion {
  @IsDefined()
  @ApiProperty({
    type: String,
    default: Criterion.CHECK_ACTION
  })
  criterion: typeof Criterion.CHECK_ACTION

  // TODO (@sam, 07/02/24): Check how to validate an array of enums.
  @IsDefined()
  // @IsIn(Object.values(Action))
  @IsEnum(Object.values(Action), {
    each: true
  })
  @ApiProperty({
    enum: Object.values(Action),
    isArray: true
  })
  args: Action[]
}

class ResourceIntegrityCriterion {
  criterion: typeof Criterion.CHECK_RESOURCE_INTEGRITY
  args: null
}

class PrincipalIdCriterion {
  criterion: typeof Criterion.CHECK_PRINCIPAL_ID
  args: string[]
}

class PrincipalRoleCriterion {
  criterion: typeof Criterion.CHECK_PRINCIPAL_ROLE
  args: string[]
}

class PrincipalGroupCriterion {
  criterion: typeof Criterion.CHECK_PRINCIPAL_GROUP
  args: string[]
}

class WalletIdCriterion {
  criterion: typeof Criterion.CHECK_WALLET_ID
  args: string[]
}

class WalletAddressCriterion {
  criterion: typeof Criterion.CHECK_WALLET_ADDRESS
  args: string[]
}

class WalletAccountTypeCriterion {
  criterion: typeof Criterion.CHECK_WALLET_ACCOUNT_TYPE
  args: AccountType[]
}

class WalletChainIdCriterion {
  criterion: typeof Criterion.CHECK_WALLET_CHAIN_ID
  args: string[]
}

class WalletGroupCriterion {
  criterion: typeof Criterion.CHECK_WALLET_GROUP
  args: string[]
}

class IntentTypeCriterion {
  criterion: typeof Criterion.CHECK_INTENT_TYPE
  args: Intents[]
}

class DestinationIdCriterion {
  criterion: typeof Criterion.CHECK_DESTINATION_ID
  args: AccountId[]
}

class DestinationAddressCriterion {
  criterion: typeof Criterion.CHECK_DESTINATION_ADDRESS
  args: string[]
}

class DestinationAccountTypeCriterion {
  criterion: typeof Criterion.CHECK_DESTINATION_ACCOUNT_TYPE
  args: AccountType[]
}

class DestinationClassificationCriterion {
  criterion: typeof Criterion.CHECK_DESTINATION_CLASSIFICATION
  args: string[]
}

class IntentContractCriterion {
  criterion: typeof Criterion.CHECK_INTENT_CONTRACT
  args: AccountId[]
}

class IntentTokenCriterion {
  criterion: typeof Criterion.CHECK_INTENT_TOKEN
  args: AccountId[]
}

class IntentSpenderCriterion {
  criterion: typeof Criterion.CHECK_INTENT_SPENDER
  args: AccountId[]
}

class IntentChainIdCriterion {
  criterion: typeof Criterion.CHECK_INTENT_CHAIN_ID
  args: string[]
}

class IntentHexSignatureCriterion {
  criterion: typeof Criterion.CHECK_INTENT_HEX_SIGNATURE
  args: Hex[]
}

class IntentAmountCriterion {
  criterion: typeof Criterion.CHECK_INTENT_AMOUNT
  args: AmountCondition
}

class ERC721TokenIdCriterion {
  criterion: typeof Criterion.CHECK_ERC721_TOKEN_ID
  args: AssetId[]
}

class ERC1155TokenIdCriterion {
  criterion: typeof Criterion.CHECK_ERC1155_TOKEN_ID
  args: AssetId[]
}

class ERC1155TransfersCriterion {
  criterion: typeof Criterion.CHECK_ERC1155_TRANSFERS
  args: ERC1155AmountCondition[]
}

class IntentMessageCriterion {
  criterion: typeof Criterion.CHECK_INTENT_MESSAGE
  args: SignMessageCondition
}

class IntentPayloadCriterion {
  criterion: typeof Criterion.CHECK_INTENT_PAYLOAD
  args: string[]
}

class IntentAlgorithmCriterion {
  criterion: typeof Criterion.CHECK_INTENT_ALGORITHM
  args: Alg[]
}

class IntentDomainCriterion {
  criterion: typeof Criterion.CHECK_INTENT_DOMAIN
  args: SignTypedDataDomainCondition
}

class PermitDeadlineCriterion {
  criterion: typeof Criterion.CHECK_PERMIT_DEADLINE
  args: PermitDeadlineCondition
}

class GasFeeAmountCriterion {
  criterion: typeof Criterion.CHECK_GAS_FEE_AMOUNT
  args: AmountCondition
}

class NonceRequiredCriterion {
  criterion: typeof Criterion.CHECK_NONCE_EXISTS
  args: null
}

class NonceNotRequiredCriterion {
  criterion: typeof Criterion.CHECK_NONCE_NOT_EXISTS
  args: null
}

class ApprovalsCriterion {
  criterion: typeof Criterion.CHECK_APPROVALS
  args: ApprovalCondition[]
}

class SpendingLimitCriterion {
  criterion: typeof Criterion.CHECK_SPENDING_LIMIT
  args: SpendingLimitCondition
}

const SUPPORTED_CRITERION = [
  ActionCriterion,
  ResourceIntegrityCriterion,
  PrincipalIdCriterion,
  PrincipalRoleCriterion,
  PrincipalGroupCriterion,
  WalletIdCriterion,
  WalletAddressCriterion,
  WalletAccountTypeCriterion,
  WalletChainIdCriterion,
  WalletGroupCriterion,
  IntentTypeCriterion,
  DestinationIdCriterion,
  DestinationAddressCriterion,
  DestinationAccountTypeCriterion,
  DestinationClassificationCriterion,
  IntentContractCriterion,
  IntentTokenCriterion,
  IntentSpenderCriterion,
  IntentChainIdCriterion,
  IntentHexSignatureCriterion,
  IntentAmountCriterion,
  ERC721TokenIdCriterion,
  ERC1155TokenIdCriterion,
  ERC1155TransfersCriterion,
  IntentMessageCriterion,
  IntentPayloadCriterion,
  IntentAlgorithmCriterion,
  IntentDomainCriterion,
  PermitDeadlineCriterion,
  GasFeeAmountCriterion,
  NonceRequiredCriterion,
  NonceNotRequiredCriterion,
  ApprovalsCriterion,
  SpendingLimitCriterion
] as const

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

@ApiExtraModels(...SUPPORTED_CRITERION)
export class Policy {
  @IsDefined()
  @IsString()
  @ApiProperty()
  name: string

  // @ValidateNested({ each: true })
  // @Type(() => BaseCriterion, {
  //   discriminator: {
  //     property: 'criterion',
  //     subTypes: [{ value: ActionCriterion, name: Criterion.CHECK_ACTION }]
  //   }
  // })
  // @Type((opts) => {
  //   const foo = opts?.object.when.map((item: PolicyCriterion) => {
  //     switch (item.criterion) {
  //       case Criterion.CHECK_ACTION:
  //         return ActionCriterion
  //       default:
  //         return BaseCriterion
  //     }
  //   })

  //   console.log(foo)

  //   return foo
  // })
  @Type(() => ActionCriterion)
  @ApiProperty({
    oneOf: SUPPORTED_CRITERION.map((entity) => ({
      $ref: getSchemaPath(entity)
    }))
  })
  when: PolicyCriterion[]

  @IsDefined()
  @IsIn(Object.values(Then))
  @ApiProperty({
    enum: Object.values(Then)
  })
  then: Then
}
