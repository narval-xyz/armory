import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

export class AuthCredentialDto {
  constructor(data: AuthCredentialDto) {
    this.uid = data.uid
    this.pubKey = data.pubKey
    this.alg = data.alg
    this.userId = data.userId
  }

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  uid: string

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  pubKey: string

  @IsEnum(Alg)
  @ApiProperty({ enum: Alg })
  alg: Alg

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  userId: string
}
