import { Alg } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'

export class RequestSignatureDto {
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
