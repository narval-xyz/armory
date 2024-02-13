import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsDefined, ValidateNested } from 'class-validator'
import { RequestSignatureDto } from './request-signature.dto'

@ApiExtraModels(RequestSignatureDto)
export class BaseAdminRequestPayloadDto {
  @IsDefined()
  @ApiProperty()
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
