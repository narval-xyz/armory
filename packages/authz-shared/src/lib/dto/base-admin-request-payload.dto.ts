import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsDefined, ValidateNested } from 'class-validator'
import { RequestSignatureDto } from './request-signature.dto'

export class BaseAdminRequestPayloadDto {
  @IsDefined()
  @ApiProperty({
    type: () => RequestSignatureDto
  })
  authentication: RequestSignatureDto

  @IsDefined()
  @ArrayNotEmpty()
  @ValidateNested()
  @ApiProperty({
    type: () => RequestSignatureDto,
    isArray: true
  })
  approvals: RequestSignatureDto[]
}
