import { Curves, KeyTypes } from '@narval/signature'
import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class GenerateKeyDto {
  constructor(curve?: typeof Curves.SECP256K1, keyId?: string, alg?: typeof KeyTypes.EC) {
    this.curve = curve
    this.keyId = keyId
    this.alg = alg
  }

  @ApiProperty()
  curve?: typeof Curves.SECP256K1

  @ApiProperty()
  alg?: typeof KeyTypes.EC

  @IsString()
  @ApiProperty()
  keyId?: string
}
