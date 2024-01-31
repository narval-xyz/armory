import { UserRole } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString } from 'class-validator'

export class UserDto {
  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsEnum(UserRole)
  @IsDefined()
  @ApiProperty({
    enum: UserRole
  })
  role: UserRole
}
