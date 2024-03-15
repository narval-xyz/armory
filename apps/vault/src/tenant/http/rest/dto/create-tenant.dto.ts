import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class CreateTenantDto {
  @IsString()
  @ApiPropertyOptional()
  clientId?: string
}
