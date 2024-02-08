import { UserRole } from '@narval/authz-shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsIn, IsString } from 'class-validator'
import { User } from '../../../../shared/types/entities.types'

export class UserDto {
  constructor(user: User) {
    this.uid = user.uid
    this.role = user.role
  }

  @IsString()
  @IsDefined()
  @ApiProperty()
  uid: string

  @IsIn(Object.values(UserRole))
  @IsDefined()
  @ApiProperty({
    enum: Object.values(UserRole)
  })
  role: UserRole
}
