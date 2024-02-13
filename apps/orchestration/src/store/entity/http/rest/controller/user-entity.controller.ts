import { Body, Controller, HttpStatus, Patch, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { UserEntityService } from '../../../core/service/user-entity.service'
import { CreateUserRequestDto } from '../dto/create-user-request.dto'
import { CreateUserResponseDto } from '../dto/create-user-response.dto'
import { UpdateUserRequestDto } from '../dto/update-user-request.dto'
import { UpdateUserResponseDto } from '../dto/update-user-response.dto'

@Controller('/store/users')
@ApiTags('Entity Store')
export class UserEntityController {
  constructor(private userEntityService: UserEntityService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new user entity'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateUserResponseDto
  })
  async create(@OrgId() orgId: string, @Body() body: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const { uid, role, credential } = body.request.user

    await this.userEntityService.create(orgId, { uid, role }, credential)

    return new CreateUserResponseDto({
      user: { uid, role }
    })
  }

  @Patch('/:uid')
  @ApiOperation({
    summary: 'Updates an existing user'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateUserResponseDto
  })
  async update(@OrgId() orgId: string, @Body() body: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const { uid, role } = body.request.user

    await this.userEntityService.grantRole(uid, role)

    return new UpdateUserResponseDto({
      user: { uid, role }
    })
  }
}
