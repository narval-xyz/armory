import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsArray, IsString, ArrayMinSize } from 'class-validator';

export function IsNotEmptyArrayString() {
  return applyDecorators(
    IsDefined(),
    IsArray(),
    IsString({ each: true }),
    ApiProperty({ type: String, isArray: true }),
    ArrayMinSize(1)
  );
}