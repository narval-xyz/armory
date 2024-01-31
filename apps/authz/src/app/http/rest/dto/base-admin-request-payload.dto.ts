import { RequestSignatureDto } from '@app/authz/app/http/rest/dto/request-signature.dto'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { IsDefined, ValidateNested } from 'class-validator'

@ApiExtraModels(RequestSignatureDto)
export class BaseAdminRequestPayloadDto {
  @IsDefined()
  @ApiProperty()
  authentication: RequestSignatureDto

  @IsDefined()
  @ValidateNested()
  @ApiProperty({
    type: () => RequestSignatureDto,
    isArray: true
  })
  approvals: RequestSignatureDto[]
}
