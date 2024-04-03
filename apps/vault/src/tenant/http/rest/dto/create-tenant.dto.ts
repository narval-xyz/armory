import { Jwk } from '@narval/signature'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class CreateTenantDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  clientId?: string

  @IsOptional()
  engineJwk?: Jwk
}
