import { NotImplementedException } from '@nestjs/common'

export abstract class SeedService {
  seed(): Promise<void> {
    throw new NotImplementedException()
  }
}
