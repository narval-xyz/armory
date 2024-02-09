import { applyDecorators } from '@nestjs/common'
import { ArrayMinSize, IsArray, IsDefined, IsString } from 'class-validator'

export function IsNotEmptyArrayString() {
  return applyDecorators(IsDefined(), IsArray(), IsString({ each: true }), ArrayMinSize(1))
}
