import { CredentialEntity, HttpSource, SourceType, UserEntity } from '@narval/policy-engine-shared'
import { PublicKey } from '@narval/signature'

export const credential = (user: UserEntity, key: PublicKey, id?: string): CredentialEntity => ({
  id: key.kid,
  userId: user.id,
  key
})

export const createHttpDataStore = (opts: {
  host: string
  clientId: string
  keys: PublicKey[]
  entityStoreKeys?: PublicKey[]
  policyStoreKeys?: PublicKey[]
}) => {
  const { host, clientId, keys, entityStoreKeys, policyStoreKeys } = opts

  const entityStoreSource: HttpSource = {
    type: SourceType.HTTP,
    url: `${host}/v1/data/entities?clientId=${clientId}`
  }

  const policyStoreSource: HttpSource = {
    type: SourceType.HTTP,
    url: `${host}/v1/data/policies?clientId=${clientId}`
  }

  return {
    entity: {
      data: entityStoreSource,
      signature: entityStoreSource,
      keys: entityStoreKeys || keys
    },
    policy: {
      data: policyStoreSource,
      signature: policyStoreSource,
      keys: policyStoreKeys || keys
    }
  }
}
