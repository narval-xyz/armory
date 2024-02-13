import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Matches } from 'class-validator'
import { Criterion } from '../types/policy.type'

export function ValidateCriterion(name: string) {
  return applyDecorators(Matches(name), ApiProperty({ type: Criterion, default: name }))
}
