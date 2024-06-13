import { CredentialEntity, UserEntity } from '@narval/policy-engine-shared'
import { PublicKey } from '@narval/signature'
import { v4 as uuid } from 'uuid'

export const credential = (user: UserEntity, key: PublicKey, id?: string): CredentialEntity => ({
  id: id || uuid(),
  userId: user.id,
  key
})
