import { Alg } from '@narval/signature'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'

export class SignatureDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  sig: string

  @IsIn(Object.values(Alg))
  @IsDefined()
  @ApiProperty({ enum: Object.values(Alg) })
  alg: Alg

  @IsString()
  @IsDefined()
  @ApiProperty()
  pubKey: string
}
