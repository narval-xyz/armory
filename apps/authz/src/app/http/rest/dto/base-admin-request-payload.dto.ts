import { RequestSignatureDto } from '@app/authz/app/http/rest/dto/request-signature.dto'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsDefined, ValidateNested } from 'class-validator'

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
