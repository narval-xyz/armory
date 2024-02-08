import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'
import { Alg } from '../type/action.type'

export class AuthCredentialDto {
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
