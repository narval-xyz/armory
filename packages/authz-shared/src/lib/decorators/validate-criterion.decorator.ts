import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, Matches } from 'class-validator'
import { Criterion } from '../type/policy-builder.type'

export function ValidateCriterion(name: string) {
  return applyDecorators(IsDefined(), IsString(), Matches(name), ApiProperty({ type: Criterion, default: name }))
}
