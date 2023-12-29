import { Test } from '@nestjs/testing'
import { TransactionEngineModuleService } from './transaction-engine-module.service'

describe('TransactionEngineModuleService', () => {
  let service: TransactionEngineModuleService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TransactionEngineModuleService]
    }).compile()

    service = module.get(TransactionEngineModuleService)
  })

  it('should be defined', () => {
    expect(service).toBeTruthy()
  })
})
