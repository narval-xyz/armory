import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'
import { Alg } from '../type/action.type'

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
  @ApiProperty({
    enum: Object.values(Alg)
  })
  alg: Alg

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  userId: string
}
