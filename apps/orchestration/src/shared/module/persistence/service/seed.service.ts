import { NotImplementedException } from '@nestjs/common'

export abstract class SeedService {
  germinate(): Promise<void> {
    throw new NotImplementedException()
  }
}
