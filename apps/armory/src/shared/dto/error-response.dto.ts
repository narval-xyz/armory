import { HttpStatus } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsOptional, IsString } from 'class-validator'

class OriginErrorDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string

  @IsString()
  @IsDefined()
  @ApiProperty()
  name: string

  @IsOptional()
  @ApiProperty({
    description: 'The error stacktrace (not available in production)',
    required: false
  })
  stack: string
}

export class ErrorResponseDto {
  @IsEnum(HttpStatus)
  @IsDefined()
  @ApiProperty({
    enum: HttpStatus,
    default: HttpStatus.OK
  })
  status: HttpStatus

  @IsString()
  @IsDefined()
  @ApiProperty()
  message: string

  @IsOptional()
  @ApiProperty({
    description: 'Extra data about the error',
    required: false
  })
  context: unknown

  @IsOptional()
  @ApiProperty({
    description: 'The error stacktrace (not available in production)',
    required: false
  })
  stack: string

  @IsOptional()
  @ApiProperty({
    description: 'The origin error (not available in production)',
    required: false,
    type: OriginErrorDto
  })
  origin: OriginErrorDto
}
