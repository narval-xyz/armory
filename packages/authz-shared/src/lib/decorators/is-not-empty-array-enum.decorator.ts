import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsDefined, IsEnum } from 'class-validator'

export function IsNotEmptyArrayEnum(Enum: object) {
  return applyDecorators(
    IsDefined,
    IsArray,
    IsEnum(Enum, { each: true }),
    ApiProperty({
      enum: Object.values(Enum),
      isArray: true
    }),
    ArrayMinSize(1)
  )
}
