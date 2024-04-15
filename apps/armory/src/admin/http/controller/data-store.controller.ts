import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@Controller('/data-store')
@ApiTags('Data Store')
export class DataStoreController {
  constructor() {}
}
