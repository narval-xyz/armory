import { User } from '@app/authz/shared/types/entities.types'
import { UserRole } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsString } from 'class-validator'

export class UserDto {
  constructor(user: User) {
    this.uid = user.uid
    this.role = user.role
  }

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
