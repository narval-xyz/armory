import {
  AccountId,
  AccountType,
  Action,
  Alg,
  AssetId,
  BaseAction,
  BaseAdminRequest,
  EntityType,
  FiatCurrency,
  IdentityOperators,
  IsAccountId,
  IsAssetId,
  IsHexString,
  IsNotEmptyArrayEnum,
  IsNotEmptyArrayString,
  UserRole,
  ValueOperators
} from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator'
import { Address, Hex } from 'viem'
import { ValidateCriterion } from '../decorators/validate-criterion.decorator'

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

export const TimeWindow = {
  ROLLING: 'rolling',
  FIXED: 'fixed'
} as const

export type TimeWindow = (typeof TimeWindow)[keyof typeof TimeWindow]

export class AmountCondition {
  @IsIn([...Object.values(FiatCurrency), '*'])
  currency: FiatCurrency | '*'

  @IsNotEmpty()
  @IsEnum(ValueOperators)
  operator: ValueOperators

  @IsNotEmpty()
  @IsNumberString()
  value: string
}

export class ERC1155AmountCondition {
  @IsAssetId()
  tokenId: AssetId

  @IsNotEmpty()
  @IsEnum(ValueOperators)
  operator: ValueOperators

  @IsNotEmpty()
  @IsNumberString()
  value: string
}

export class SignMessageCondition {
  @IsNotEmpty()
  @IsIn([ValueOperators.EQUAL, IdentityOperators.CONTAINS])
  operator: ValueOperators.EQUAL | IdentityOperators.CONTAINS

  @IsNotEmpty()
  @IsString()
  value: string
}

export class SignTypedDataDomainCondition {
  @IsOptional()
  @IsNotEmptyArrayString()
  @IsNumberString({}, { each: true })
  version?: string[]

  @IsOptional()
  @IsNotEmptyArrayString()
  @IsNumberString({}, { each: true })
  chainId?: string[]

  @IsOptional()
  @IsNotEmptyArrayString()
  name?: string[]

  @IsOptional()
  @IsNotEmptyArrayString()
  @IsHexString({ each: true })
  verifyingContract?: Address[]
}

export class PermitDeadlineCondition {
  @IsNotEmpty()
  @IsEnum(ValueOperators)
  operator: ValueOperators

  @IsNotEmpty()
  @IsNumberString()
  value: string // timestamp in ms
}

export class ApprovalCondition {
  @IsDefined()
  @IsNumber()
  approvalCount: number

  @IsDefined()
  @IsBoolean()
  countPrincipal: boolean

  @IsDefined()
  @IsIn(Object.values(EntityType))
  approvalEntityType: EntityType

  @IsNotEmptyArrayString()
  entityIds: string[]
}

export class SpendingLimitTimeWindow {
  @IsEnum(TimeWindow)
  @IsOptional()
  type?: TimeWindow

  @IsNumber()
  @IsOptional()
  value?: number // in seconds

  @IsNumber()
  @IsOptional()
  startDate?: number // in seconds

  @IsNumber()
  @IsOptional()
  endDate?: number // in seconds
}

export class SpendingLimitFilters {
  @IsNotEmptyArrayString()
  @IsAssetId({ each: true })
  @IsOptional()
  tokens?: AssetId[]

  @IsNotEmptyArrayString()
  @IsOptional()
  users?: string[]

  @IsNotEmptyArrayString()
  @IsAccountId({ each: true })
  @IsOptional()
  resources?: AccountId[]

  @IsNotEmptyArrayString()
  @IsNumberString({}, { each: true })
  @IsOptional()
  chains?: string[]

  @IsNotEmptyArrayString()
  @IsOptional()
  userGroups?: string[]

  @IsNotEmptyArrayString()
  @IsOptional()
  walletGroups?: string[]
}

export class SpendingLimitCondition {
  @IsString()
  @IsNotEmpty()
  limit: string

  @IsIn(Object.values(FiatCurrency))
  @IsOptional()
  currency?: FiatCurrency

  @ValidateNested()
  @Type(() => SpendingLimitTimeWindow)
  @IsOptional()
  timeWindow?: SpendingLimitTimeWindow

  @ValidateNested()
  @Type(() => SpendingLimitFilters)
  @IsOptional()
  filters?: SpendingLimitFilters
}

class BaseCriterion {
  criterion: Criterion
}

class ActionCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_ACTION)
  criterion: typeof Criterion.CHECK_ACTION

  @IsNotEmptyArrayEnum(Action)
  args: Action[]
}

class ResourceIntegrityCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_RESOURCE_INTEGRITY)
  criterion: typeof Criterion.CHECK_RESOURCE_INTEGRITY

  args: null
}

class PrincipalIdCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_PRINCIPAL_ID)
  criterion: typeof Criterion.CHECK_PRINCIPAL_ID

  @IsNotEmptyArrayString()
  args: string[]
}

class PrincipalRoleCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_PRINCIPAL_ROLE)
  criterion: typeof Criterion.CHECK_PRINCIPAL_ROLE

  @IsNotEmptyArrayEnum(UserRole)
  args: UserRole[]
}

class PrincipalGroupCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_PRINCIPAL_GROUP)
  criterion: typeof Criterion.CHECK_PRINCIPAL_GROUP

  @IsNotEmptyArrayString()
  args: string[]
}

class WalletIdCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_WALLET_ID)
  criterion: typeof Criterion.CHECK_WALLET_ID

  @IsNotEmptyArrayString()
  args: string[]
}

class WalletAddressCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_WALLET_ADDRESS)
  criterion: typeof Criterion.CHECK_WALLET_ADDRESS

  @IsNotEmptyArrayString()
  args: string[]
}

class WalletAccountTypeCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_WALLET_ACCOUNT_TYPE)
  criterion: typeof Criterion.CHECK_WALLET_ACCOUNT_TYPE

  @IsNotEmptyArrayEnum(AccountType)
  args: AccountType[]
}

class WalletChainIdCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_WALLET_CHAIN_ID)
  criterion: typeof Criterion.CHECK_WALLET_CHAIN_ID

  @IsNotEmptyArrayString()
  args: string[]
}

class WalletGroupCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_WALLET_GROUP)
  criterion: typeof Criterion.CHECK_WALLET_GROUP

  @IsNotEmptyArrayString()
  args: string[]
}

class IntentTypeCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_TYPE)
  criterion: typeof Criterion.CHECK_INTENT_TYPE

  @IsNotEmptyArrayEnum(Intents)
  args: Intents[]
}

class DestinationIdCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_DESTINATION_ID)
  criterion: typeof Criterion.CHECK_DESTINATION_ID

  @IsNotEmptyArrayString()
  @IsAccountId({ each: true })
  args: AccountId[]
}

class DestinationAddressCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_DESTINATION_ADDRESS)
  criterion: typeof Criterion.CHECK_DESTINATION_ADDRESS

  @IsNotEmptyArrayString()
  args: string[]
}

class DestinationAccountTypeCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_DESTINATION_ACCOUNT_TYPE)
  criterion: typeof Criterion.CHECK_DESTINATION_ACCOUNT_TYPE

  @IsNotEmptyArrayEnum(AccountType)
  args: AccountType[]
}

class DestinationClassificationCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_DESTINATION_CLASSIFICATION)
  criterion: typeof Criterion.CHECK_DESTINATION_CLASSIFICATION

  @IsNotEmptyArrayString()
  args: string[]
}

class IntentContractCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_CONTRACT)
  criterion: typeof Criterion.CHECK_INTENT_CONTRACT

  @IsNotEmptyArrayString()
  @IsAccountId({ each: true })
  args: AccountId[]
}

class IntentTokenCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_TOKEN)
  criterion: typeof Criterion.CHECK_INTENT_TOKEN

  @IsNotEmptyArrayString()
  @IsAssetId({ each: true })
  args: AssetId[]
}

class IntentSpenderCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_SPENDER)
  criterion: typeof Criterion.CHECK_INTENT_SPENDER

  @IsNotEmptyArrayString()
  @IsAccountId({ each: true })
  args: AccountId[]
}

class IntentChainIdCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_CHAIN_ID)
  criterion: typeof Criterion.CHECK_INTENT_CHAIN_ID

  @IsNotEmptyArrayString()
  args: string[]
}

class IntentHexSignatureCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_HEX_SIGNATURE)
  criterion: typeof Criterion.CHECK_INTENT_HEX_SIGNATURE

  @IsNotEmptyArrayString()
  @IsHexString({ each: true })
  args: Hex[]
}

class IntentAmountCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_AMOUNT)
  criterion: typeof Criterion.CHECK_INTENT_AMOUNT

  @ValidateNested()
  @Type(() => AmountCondition)
  args: AmountCondition
}

class ERC721TokenIdCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_ERC721_TOKEN_ID)
  criterion: typeof Criterion.CHECK_ERC721_TOKEN_ID

  @IsNotEmptyArrayString()
  @IsAssetId({ each: true })
  args: AssetId[]
}

class ERC1155TokenIdCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_ERC1155_TOKEN_ID)
  criterion: typeof Criterion.CHECK_ERC1155_TOKEN_ID

  @IsNotEmptyArrayString()
  @IsAssetId({ each: true })
  args: AssetId[]
}

class ERC1155TransfersCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_ERC1155_TRANSFERS)
  criterion: typeof Criterion.CHECK_ERC1155_TRANSFERS

  @ValidateNested()
  @Type(() => ERC1155AmountCondition)
  args: ERC1155AmountCondition[]
}

class IntentMessageCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_MESSAGE)
  criterion: typeof Criterion.CHECK_INTENT_MESSAGE

  @ValidateNested()
  @Type(() => SignMessageCondition)
  args: SignMessageCondition
}

class IntentPayloadCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_PAYLOAD)
  criterion: typeof Criterion.CHECK_INTENT_PAYLOAD

  @IsNotEmptyArrayString()
  args: string[]
}

class IntentAlgorithmCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_ALGORITHM)
  criterion: typeof Criterion.CHECK_INTENT_ALGORITHM

  @IsNotEmptyArrayEnum(Alg)
  args: Alg[]
}

class IntentDomainCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_DOMAIN)
  criterion: typeof Criterion.CHECK_INTENT_DOMAIN

  @ValidateNested()
  @Type(() => SignTypedDataDomainCondition)
  args: SignTypedDataDomainCondition
}

class PermitDeadlineCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_PERMIT_DEADLINE)
  criterion: typeof Criterion.CHECK_PERMIT_DEADLINE

  @ValidateNested()
  @Type(() => PermitDeadlineCondition)
  args: PermitDeadlineCondition
}

class GasFeeAmountCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_GAS_FEE_AMOUNT)
  criterion: typeof Criterion.CHECK_GAS_FEE_AMOUNT

  @ValidateNested()
  @Type(() => AmountCondition)
  args: AmountCondition
}

class NonceRequiredCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_NONCE_EXISTS)
  criterion: typeof Criterion.CHECK_NONCE_EXISTS

  args: null
}

class NonceNotRequiredCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_NONCE_NOT_EXISTS)
  criterion: typeof Criterion.CHECK_NONCE_NOT_EXISTS

  args: null
}

class ApprovalsCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_APPROVALS)
  criterion: typeof Criterion.CHECK_APPROVALS

  @ValidateNested()
  @Type(() => ApprovalCondition)
  args: ApprovalCondition[]
}

class SpendingLimitCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_SPENDING_LIMIT)
  criterion: typeof Criterion.CHECK_SPENDING_LIMIT

  @ValidateNested()
  @Type(() => SpendingLimitCondition)
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

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    return value.map((criterion: PolicyCriterion) => {
      return instantiateCriterion(criterion)
    })
  })
  @ApiProperty({
    oneOf: SUPPORTED_CRITERION.map((entity) => ({
      $ref: getSchemaPath(entity)
    }))
  })
  when: PolicyCriterion[]

  @IsDefined()
  @IsIn(Object.values(Then))
  @ApiProperty({ enum: Object.values(Then) })
  then: Then
}

const instantiateCriterion = (criterion: PolicyCriterion) => {
  switch (criterion.criterion) {
    case Criterion.CHECK_ACTION:
      return plainToInstance(ActionCriterion, criterion)
    case Criterion.CHECK_RESOURCE_INTEGRITY:
      return plainToInstance(ResourceIntegrityCriterion, criterion)
    case Criterion.CHECK_PRINCIPAL_ID:
      return plainToInstance(PrincipalIdCriterion, criterion)
    case Criterion.CHECK_PRINCIPAL_ROLE:
      return plainToInstance(PrincipalRoleCriterion, criterion)
    case Criterion.CHECK_PRINCIPAL_GROUP:
      return plainToInstance(PrincipalGroupCriterion, criterion)
    case Criterion.CHECK_WALLET_ID:
      return plainToInstance(WalletIdCriterion, criterion)
    case Criterion.CHECK_WALLET_ADDRESS:
      return plainToInstance(WalletAddressCriterion, criterion)
    case Criterion.CHECK_WALLET_ACCOUNT_TYPE:
      return plainToInstance(WalletAccountTypeCriterion, criterion)
    case Criterion.CHECK_WALLET_CHAIN_ID:
      return plainToInstance(WalletChainIdCriterion, criterion)
    case Criterion.CHECK_WALLET_GROUP:
      return plainToInstance(WalletGroupCriterion, criterion)
    case Criterion.CHECK_INTENT_TYPE:
      return plainToInstance(IntentTypeCriterion, criterion)
    case Criterion.CHECK_DESTINATION_ID:
      return plainToInstance(DestinationIdCriterion, criterion)
    case Criterion.CHECK_DESTINATION_ADDRESS:
      return plainToInstance(DestinationAddressCriterion, criterion)
    case Criterion.CHECK_DESTINATION_ACCOUNT_TYPE:
      return plainToInstance(DestinationAccountTypeCriterion, criterion)
    case Criterion.CHECK_DESTINATION_CLASSIFICATION:
      return plainToInstance(DestinationClassificationCriterion, criterion)
    case Criterion.CHECK_INTENT_CONTRACT:
      return plainToInstance(IntentContractCriterion, criterion)
    case Criterion.CHECK_INTENT_TOKEN:
      return plainToInstance(IntentTokenCriterion, criterion)
    case Criterion.CHECK_INTENT_SPENDER:
      return plainToInstance(IntentSpenderCriterion, criterion)
    case Criterion.CHECK_INTENT_CHAIN_ID:
      return plainToInstance(IntentChainIdCriterion, criterion)
    case Criterion.CHECK_INTENT_HEX_SIGNATURE:
      return plainToInstance(IntentHexSignatureCriterion, criterion)
    case Criterion.CHECK_INTENT_AMOUNT:
      return plainToInstance(IntentAmountCriterion, criterion)
    case Criterion.CHECK_ERC721_TOKEN_ID:
      return plainToInstance(ERC721TokenIdCriterion, criterion)
    case Criterion.CHECK_ERC1155_TOKEN_ID:
      return plainToInstance(ERC1155TokenIdCriterion, criterion)
    case Criterion.CHECK_ERC1155_TRANSFERS:
      return plainToInstance(ERC1155TransfersCriterion, criterion)
    case Criterion.CHECK_INTENT_MESSAGE:
      return plainToInstance(IntentMessageCriterion, criterion)
    case Criterion.CHECK_INTENT_PAYLOAD:
      return plainToInstance(IntentPayloadCriterion, criterion)
    case Criterion.CHECK_INTENT_ALGORITHM:
      return plainToInstance(IntentAlgorithmCriterion, criterion)
    case Criterion.CHECK_INTENT_DOMAIN:
      return plainToInstance(IntentDomainCriterion, criterion)
    case Criterion.CHECK_PERMIT_DEADLINE:
      return plainToInstance(PermitDeadlineCriterion, criterion)
    case Criterion.CHECK_GAS_FEE_AMOUNT:
      return plainToInstance(GasFeeAmountCriterion, criterion)
    case Criterion.CHECK_NONCE_EXISTS:
      return plainToInstance(NonceRequiredCriterion, criterion)
    case Criterion.CHECK_NONCE_NOT_EXISTS:
      return plainToInstance(NonceNotRequiredCriterion, criterion)
    case Criterion.CHECK_APPROVALS:
      return plainToInstance(ApprovalsCriterion, criterion)
    case Criterion.CHECK_SPENDING_LIMIT:
      return plainToInstance(SpendingLimitCriterion, criterion)
    default:
      throw new Error('Unknown criterion: ' + criterion)
  }
}

export type SetPolicyRulesAction = BaseAction & {
  action: typeof Action.SET_POLICY_RULES
  data: Policy[]
}

export type SetPolicyRulesRequest = BaseAdminRequest & {
  request: SetPolicyRulesAction
}
