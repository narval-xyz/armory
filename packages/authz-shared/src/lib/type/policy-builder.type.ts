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
  UserRole,
  ValueOperators
} from '@narval/authz-shared'
import { Intents } from '@narval/transaction-request-intent'
import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Transform, plainToInstance } from 'class-transformer'
import { IsDefined, IsIn, IsString, Matches, ValidateNested } from 'class-validator'
import { IsAccountId } from '../decorators/is-account-id.decorator'
import { IsAssetId } from '../decorators/is-asset-id.decorator'
import { IsNotEmptyArrayEnum } from '../decorators/is-not-empty-array-enum.decorator'
import { IsNotEmptyArrayString } from '../decorators/is-not-empty-array-string.decorator'
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
  @IsAccountId({ each: true })
  args: AccountId[]
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
  @Matches(/^0x[a-fA-F0-9]+$/, { each: true })
  args: Hex[]
}

class IntentAmountCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_AMOUNT)
  criterion: typeof Criterion.CHECK_INTENT_AMOUNT

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

  args: ERC1155AmountCondition[]
}

class IntentMessageCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_INTENT_MESSAGE)
  criterion: typeof Criterion.CHECK_INTENT_MESSAGE

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

  args: SignTypedDataDomainCondition
}

class PermitDeadlineCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_PERMIT_DEADLINE)
  criterion: typeof Criterion.CHECK_PERMIT_DEADLINE

  args: PermitDeadlineCondition
}

class GasFeeAmountCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_GAS_FEE_AMOUNT)
  criterion: typeof Criterion.CHECK_GAS_FEE_AMOUNT

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

  args: ApprovalCondition[]
}

class SpendingLimitCriterion extends BaseCriterion {
  @ValidateCriterion(Criterion.CHECK_SPENDING_LIMIT)
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
  @ApiProperty({ type: String })
  name: string

  @ValidateNested({ each: true })
  @Transform(({ value }) => {
    return value.map(({ criterion }: PolicyCriterion) => instantiateCriterion(criterion))
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

const instantiateCriterion = (criterion: Criterion) => {
  switch (criterion) {
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
