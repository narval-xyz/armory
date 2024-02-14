import { Action, BaseActionDto, BaseActionRequestDto } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsEnum, IsNotEmpty, IsString, ValidateNested } from 'class-validator'
import { AuthCredentialDto } from './auth-credential.dto'

class CreateOrganizationDataDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsDefined()
  @Type(() => AuthCredentialDto)
  @ValidateNested()
  @ApiProperty({
    type: AuthCredentialDto
  })
  credential: AuthCredentialDto
}

class CreateOrganizationActionDto extends BaseActionDto {
  @IsEnum(Action)
  @IsDefined()
  @ApiProperty({
    enum: Object.values(Action),
    default: Action.CREATE_ORGANIZATION
  })
  action: typeof Action.CREATE_ORGANIZATION

  @IsDefined()
  @Type(() => CreateOrganizationDataDto)
  @ValidateNested()
  @ApiProperty({
    type: CreateOrganizationDataDto
  })
  organization: CreateOrganizationDataDto
}

export class CreateOrganizationRequestDto extends BaseActionRequestDto {
  @IsDefined()
  @Type(() => CreateOrganizationActionDto)
  @ValidateNested()
  @ApiProperty({
    type: CreateOrganizationActionDto
  })
  request: CreateOrganizationActionDto
}
