import { Jwk } from '@narval/signature'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateClientDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  clientId?: string

  @IsOptional()
  engineJwk?: Jwk

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  audience?: string

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  issuer?: string

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional()
  maxTokenAge?: number

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  baseUrl?: string
}
