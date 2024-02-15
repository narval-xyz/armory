import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class AuthCredentialDto {
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
