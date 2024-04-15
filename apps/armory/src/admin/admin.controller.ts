import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller('/admin')
@ApiTags('Admin')
export class AdminController {
  constructor() {}
}
