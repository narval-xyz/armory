import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsDefined, IsEnum } from 'class-validator'

export function IsNotEmptyArrayEnum(o: object) {
  return applyDecorators(
    IsDefined(),
    IsArray(),
    IsEnum(o, { each: true }),
    ArrayMinSize(1),
    ApiProperty({ enum: Object.values(o), isArray: true })
  )
}
