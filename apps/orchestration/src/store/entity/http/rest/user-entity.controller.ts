import { CreateUserRequestDto, CreateUserResponseDto } from '@narval/authz-shared'
import { Body, Controller, Post } from '@nestjs/common'
import { OrgId } from '../../../../shared/decorator/org-id.decorator'
import { UserEntityService } from '../../core/service/user-entity.service'

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
}
