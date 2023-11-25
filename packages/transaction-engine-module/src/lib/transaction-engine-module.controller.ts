import { Controller, Get } from '@nestjs/common';
import { TransactionEngineModuleService } from './transaction-engine-module.service';

@Controller('transaction-engine')
export class TransactionEngineModuleController {
  constructor(
    private transactionEngineModuleService: TransactionEngineModuleService
  ) {}

  @Get()
  hello() {
    return { message: 'Hello Transaction Engine Module' };
  }
}
