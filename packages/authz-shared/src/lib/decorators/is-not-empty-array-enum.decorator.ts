import { applyDecorators } from '@nestjs/common'
import { ArrayMinSize, IsArray, IsDefined, IsEnum } from 'class-validator'

export function IsNotEmptyArrayEnum(obj: object) {
  return applyDecorators(IsDefined(), IsArray(), IsEnum(obj, { each: true }), ArrayMinSize(1))
}
