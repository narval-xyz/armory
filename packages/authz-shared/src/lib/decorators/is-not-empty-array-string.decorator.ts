import { applyDecorators } from '@nestjs/common'
import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator'

export function IsNotEmptyArrayString() {
  return applyDecorators(IsArray(), IsNotEmpty({ each: true }), IsString({ each: true }), ArrayMinSize(1))
}
