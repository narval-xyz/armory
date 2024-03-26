import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsOptional, IsString } from 'class-validator'

export class RsaPublicKeyDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  kid: string

  @IsString()
  @IsDefined()
  @ApiProperty({
    enum: ['RSA'],
    default: 'RSA'
  })
  kty: 'RSA'

  @IsString()
  @IsDefined()
  @ApiProperty({
    enum: ['RS256'],
    default: 'RS256'
  })
  alg: 'RS256'

  @IsString()
  @IsDefined()
  @ApiProperty({
    description: 'A base64Url-encoded value'
  })
  n: string

  @IsString()
  @IsDefined()
  @ApiProperty({
    description: 'A base64Url-encoded value'
  })
  e: string

  @IsIn(['enc', 'sig'])
  @IsOptional()
  @ApiProperty({
    enum: ['enc', 'sig']
  })
  use?: 'enc' | 'sig' | undefined
}
