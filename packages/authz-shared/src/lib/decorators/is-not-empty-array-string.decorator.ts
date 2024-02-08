import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsDefined, IsString } from 'class-validator'

export function IsNotEmptyArrayString() {
  return applyDecorators(
    IsDefined(),
    IsArray(),
    IsString({ each: true }),
    ArrayMinSize(1),
    ApiProperty({ type: String, isArray: true })
  )
}
