import { ApiProperty } from '@nestjs/swagger'
import { ArrayNotEmpty, IsDefined, ValidateNested } from 'class-validator'
import { SignatureDto } from './signature.dto'

export class BaseActionRequestDto {
  @IsDefined()
  @ApiProperty({
    type: () => SignatureDto
  })
  authentication: SignatureDto

  @IsDefined()
  @ArrayNotEmpty()
  @ValidateNested()
  @ApiProperty({
    type: () => SignatureDto,
    isArray: true
  })
  approvals: SignatureDto[]
}
