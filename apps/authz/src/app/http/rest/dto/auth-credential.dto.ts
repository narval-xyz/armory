import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'

export class AuthCredentialDto {
  constructor(data: AuthCredentialDto) {
    this.uid = data.uid
    this.pubKey = data.pubKey
    this.alg = data.alg
    this.userId = data.userId
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  pubKey: string

  @IsIn(Object.values(Alg))
  @IsDefined()
  @ApiProperty({ enum: Object.values(Alg) })
  alg: Alg

  @IsString()
  @IsDefined()
  @ApiProperty()
  userId: string
}
