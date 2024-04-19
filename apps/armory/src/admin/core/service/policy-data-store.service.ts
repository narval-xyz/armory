import { Policy, PolicyStore } from '@narval/policy-engine-shared'
import { Alg, Payload, SigningAlg, buildSignerEip191, hash, privateKeyToJwk, signJwt } from '@narval/signature'
import { Injectable } from '@nestjs/common'
import { ACCOUNT, UNSAFE_PRIVATE_KEY } from 'packages/policy-engine-shared/src/lib/dev.fixture'
import { PolicyDataStoreRepository } from '../../persistence/repository/policy-data-store.repository'

@Injectable()
export class PolicyDataStoreService {
  constructor(private policyDataStoreRepository: PolicyDataStoreRepository) {}

  async getPolicies(orgId: string): Promise<{ policy: PolicyStore } | null> {
    const policyStore = await this.policyDataStoreRepository.getLatestDataStore(orgId)

    if (!policyStore) {
      return null
    }

    const { data: policy } = policyStore

    return { policy: PolicyStore.parse(policy) }
  }

  async setPolicies(orgId: string, data: Policy[]) {
    const signature = await this.signDataPayload(data)
    const policy: PolicyStore = { data, signature }

    const version = await this.policyDataStoreRepository.getLatestVersion(orgId)

    return this.policyDataStoreRepository.setDataStore({
      orgId,
      version: version + 1,
      data: policy
    })
  }

  private async signDataPayload(data: Policy[]) {
    const jwk = privateKeyToJwk(UNSAFE_PRIVATE_KEY.Root, Alg.ES256K)

    const payload: Payload = {
      data: hash(data),
      sub: ACCOUNT.Root.address,
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(Date.now() / 1000)
    }

    const signature = await signJwt(
      payload,
      jwk,
      { alg: SigningAlg.EIP191 },
      buildSignerEip191(UNSAFE_PRIVATE_KEY.Root)
    )

    return signature
  }
}
