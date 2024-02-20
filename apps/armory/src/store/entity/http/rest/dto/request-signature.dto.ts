import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class RequestSignatureDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  sig: string

  @IsEnum(Alg)
  @ApiProperty({ enum: Alg })
  alg: Alg

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  pubKey: string
}
