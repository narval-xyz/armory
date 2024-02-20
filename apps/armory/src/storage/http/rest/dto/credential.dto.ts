import { Alg } from '@narval/policy-engine-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class CredentialDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  uid: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  pubKey: string

  @IsEnum(Alg)
  @ApiProperty({ enum: Alg })
  alg: Alg

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string
}
