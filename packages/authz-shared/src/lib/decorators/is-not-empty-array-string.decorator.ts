import { applyDecorators } from '@nestjs/common'
import { ArrayNotEmpty, IsNotEmpty, IsString } from 'class-validator'

export function IsNotEmptyArrayString() {
  return applyDecorators(ArrayNotEmpty(), IsNotEmpty({ each: true }), IsString({ each: true }))
}
