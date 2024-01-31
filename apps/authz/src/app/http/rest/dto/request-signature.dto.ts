import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString } from 'class-validator'

export class RequestSignatureDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  sig: string

  @IsEnum(Alg)
  @IsDefined()
  @ApiProperty({ enum: Alg })
  alg: Alg

  @IsString()
  @IsDefined()
  @ApiProperty()
  pubKey: string
}
