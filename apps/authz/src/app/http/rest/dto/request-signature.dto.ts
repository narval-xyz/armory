import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class RequestSignatureDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  sig: string

  @IsEnum(Alg)
  @ApiProperty({ enum: Alg })
  alg: Alg

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  pubKey: string
}
