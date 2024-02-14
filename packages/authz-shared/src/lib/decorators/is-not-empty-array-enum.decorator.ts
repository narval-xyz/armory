import { applyDecorators } from '@nestjs/common'
import { ArrayNotEmpty, IsEnum } from 'class-validator'

export function IsNotEmptyArrayEnum(obj: object) {
  return applyDecorators(ArrayNotEmpty(), IsEnum(obj, { each: true }))
}
