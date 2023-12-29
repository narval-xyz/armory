import { ApiProperty } from '@nestjs/swagger'

type Hex = `0x${string}`

export class TransactionDto {
  @ApiProperty()
  from: string

  @ApiProperty()
  data?: Hex

  @ApiProperty()
  to?: string

  @ApiProperty()
  value?: bigint

  @ApiProperty()
  gas?: bigint

  @ApiProperty()
  nonce?: number
}
