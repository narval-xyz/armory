import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

class DataStoreConfigurationDto {
  dataUrl: string
  signatureUrl: string
}

export class CreateTenantDto {
  @IsString()
  @ApiPropertyOptional()
  clientId?: string

  @IsDefined()
  @Type(() => DataStoreConfigurationDto)
  @ApiProperty()
  entityDataStore: DataStoreConfigurationDto

  @IsDefined()
  @Type(() => DataStoreConfigurationDto)
  @ApiProperty()
  policyDataStore: DataStoreConfigurationDto
}
