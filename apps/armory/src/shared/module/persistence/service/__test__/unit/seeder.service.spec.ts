import { LoggerModule } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { SeedService } from '../../seed.service'
import { SeederService } from '../../seeder.service'

@Injectable()
class TestSeedServiceOne extends SeedService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override async germinate(): Promise<void> {}
}

@Injectable()
class TestSeedServiceTwo extends SeedService {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  override async germinate(): Promise<void> {}
}

describe(SeederService.name, () => {
  let service: SeederService
  let seedServiceOne: TestSeedServiceOne
  let seedServiceTwo: TestSeedServiceTwo

  beforeEach(async () => {
    seedServiceOne = new TestSeedServiceOne()
    seedServiceTwo = new TestSeedServiceTwo()

    const module = await Test.createTestingModule({
      imports: [LoggerModule.forTest()],
      providers: [
        SeederService,
        {
          provide: TestSeedServiceOne,
          useValue: seedServiceOne
        },
        {
          provide: TestSeedServiceTwo,
          useValue: seedServiceTwo
        }
      ]
    }).compile()

    service = module.get<SeederService>(SeederService)
  })

  describe('seed', () => {
    it('discovers providers instance of SeedService and calls their germinate method', async () => {
      jest.spyOn(seedServiceOne, 'germinate')
      jest.spyOn(seedServiceTwo, 'germinate')

      await service.seed()

      expect(seedServiceOne.germinate).toHaveBeenCalledTimes(1)
      expect(seedServiceTwo.germinate).toHaveBeenCalledTimes(1)
    })
  })
})
