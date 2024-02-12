import { applyDecorators } from '@nestjs/common'
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty } from 'class-validator'

export function IsNotEmptyArrayEnum(obj: object) {
  return applyDecorators(IsArray(), IsNotEmpty({ each: true }), IsEnum(obj, { each: true }), ArrayMinSize(1))
}
