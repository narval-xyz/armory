import { RsaPublicKeyDto } from '@narval/nestjs-shared'
import { RsaPublicKey } from '@narval/signature'
import { ApiProperty } from '@nestjs/swagger'

export class GenerateEncryptionKeyResponseDto {
  constructor(publicKey: RsaPublicKey) {
    this.publicKey = publicKey
  }

  @ApiProperty()
  publicKey: RsaPublicKeyDto
}
