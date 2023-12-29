import { Test } from '@nestjs/testing'
import { TransactionEngineModuleController } from './transaction-engine-module.controller'
import { TransactionEngineModuleService } from './transaction-engine-module.service'

describe('TransactionEngineModuleController', () => {
  let controller: TransactionEngineModuleController

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TransactionEngineModuleService],
      controllers: [TransactionEngineModuleController]
    }).compile()

    controller = module.get(TransactionEngineModuleController)
  })

  it('should be defined', () => {
    expect(controller).toBeTruthy()
  })
})
