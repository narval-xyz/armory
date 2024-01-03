import { Controller, Get } from '@nestjs/common'

@Controller('transaction-engine')
export class TransactionEngineController {
  @Get()
  hello() {
    return { message: 'Hello Transaction Engine Module' }
  }
}
