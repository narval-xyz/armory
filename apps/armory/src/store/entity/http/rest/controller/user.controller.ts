import { Body, Controller, HttpStatus, Patch, Post } from '@nestjs/common'
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { REQUEST_HEADER_ORG_ID } from '../../../../../armory.constant'
import { OrgId } from '../../../../../shared/decorator/org-id.decorator'
import { UserService } from '../../../core/service/user.service'
import { API_PREFIX, API_TAG } from '../../../entity-store.constant'
import { CreateUserRequestDto } from '../dto/create-user-request.dto'
import { CreateUserResponseDto } from '../dto/create-user-response.dto'
import { UpdateUserRequestDto } from '../dto/update-user-request.dto'
import { UpdateUserResponseDto } from '../dto/update-user-response.dto'

@Controller(`${API_PREFIX}/users`)
@ApiTags(API_TAG)
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a new user entity'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CreateUserResponseDto
  })
  async create(@OrgId() orgId: string, @Body() body: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    const { uid, role } = body.request.user

    await this.userService.create(orgId, body)

    return new CreateUserResponseDto({
      user: { uid, role }
    })
  }

  @Patch('/:uid')
  @ApiOperation({
    summary: 'Updates an existing user'
  })
  @ApiHeader({
    name: REQUEST_HEADER_ORG_ID
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdateUserResponseDto
  })
  async update(@OrgId() orgId: string, @Body() body: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    const { uid, role } = body.request.user

    await this.userService.grantRole(uid, role)

    return new UpdateUserResponseDto({
      user: { uid, role }
    })
  }
}
