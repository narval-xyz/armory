import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ArrayNotEmpty, IsDefined, ValidateNested } from 'class-validator'
import { RequestSignatureDto } from './request-signature.dto'

@ApiExtraModels(RequestSignatureDto)
export class BaseAdminRequestPayloadDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => RequestSignatureDto)
  @ApiProperty({ type: RequestSignatureDto })
  authentication: RequestSignatureDto

  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RequestSignatureDto)
  @ApiProperty({
    type: RequestSignatureDto,
    isArray: true
  })
  approvals: RequestSignatureDto[]
}
