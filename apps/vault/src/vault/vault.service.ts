import { EvaluationResponse } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { SigningService } from './core/service/signing.service'

@Injectable()
export class VaultService {
  constructor(private signingService: SigningService) {}

  async sign(): Promise<EvaluationResponse | null> {
    return null
  }
}
