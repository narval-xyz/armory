import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString } from 'class-validator'

export class SignatureDto {
  @IsDefined()
  @IsString()
  @ApiProperty()
  hash: string

  @ApiProperty({
    enum: ['ECDSA']
  })
  type?: string = 'ECDSA'
}
