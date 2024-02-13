import { Body, Controller, Patch, Post } from '@nestjs/common'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { UserEntityService } from '../../../core/service/user-entity.service'
import { CreateUserRequestDto } from '../dto/create-user-request.dto'
import { CreateUserResponseDto } from '../dto/create-user-response.dto'
import { UpdateUserRequestDto } from '../dto/update-user-request.dto'
import { UpdateUserResponseDto } from '../dto/update-user-response.dto'

@Controller('/store/users')
export class UserEntityController {
  constructor(private userEntityService: UserEntityService) {}

  @Post()
  async create(@OrgId() orgId: string, @Body() body: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const { uid, role, credential } = body.request.user

    await this.userEntityService.create(orgId, { uid, role }, credential)

    return new CreateUserResponseDto({
      user: { uid, role }
    })
  }

  @Patch('/:uid')
  async update(@OrgId() orgId: string, @Body() body: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const { uid, role } = body.request.user

    await this.userEntityService.grantRole(uid, role)

    return new UpdateUserResponseDto({
      user: { uid, role }
    })
  }
}
