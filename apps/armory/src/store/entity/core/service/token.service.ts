import { RegisterTokensRequest, TokenEntity } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { TokenRepository } from '../../persistence/repository/token.repository'

@Injectable()
export class TokenService {
  constructor(private tokenRepository: TokenRepository) {}

  register(orgId: string, request: RegisterTokensRequest): Promise<TokenEntity[]> {
    return this.tokenRepository.create(orgId, request.request.tokens)
  }
}
