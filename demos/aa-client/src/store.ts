import { Entities, UserEntity } from '@narval/policy-engine-shared'
import { Alg, Jwk, Payload, generateJwk, hash, signJwt } from '@narval/signature'
import { User, Wallet } from './models'

export const users = new Map<string, User>([
  ['matt', { id: 'matt', name: 'Matt', role: 'admin', walletIds: [], credential: {} }]
])
const userEntities: UserEntity[] = []
users.forEach((user) => {
  userEntities.push({ id: user.id, role: user.role })
})

export const wallets = new Map<string, Wallet>()
export const policies = { policy: { data: [], signature: '' } }
export const entities = {
  entity: {
    data: {
      users: userEntities,
      wallets: [],
      tokens: [],
      userGroups: [],
      userGroupMembers: [],
      walletGroups: [],
      walletGroupMembers: [],
      addressBook: [],
      userWallets: [],
      credentials: []
    } as Entities,
    signature: ''
  }
}

export const populateUsersWithCredentials = async () => {
  const promises = Array.from(users.keys()).map(async (userId) => {
    const user = users.get(userId)
    if (user) {
      const jwk = await generateJwk(Alg.ES256K, { keyId: `${userId}-key` })
      user.credential = jwk
      users.set(userId, user)
    }
  })

  await Promise.all(promises)
}

export const signPolicyAndEntity = async (jwk: Jwk) => {
  const payload: Payload = {
    data: hash(entities.entity.data),
    sub: (jwk.addr as string) || undefined,
    iss: 'https://aa-client.narval.xyz',
    iat: Math.floor(Date.now() / 1000)
  }
  const signature = await signJwt(payload, jwk)
  entities.entity.signature = signature

  const policyPayload: Payload = {
    data: hash(policies.policy.data),
    sub: (jwk.addr as string) || undefined,
    iss: 'https://aa-client.narval.xyz',
    iat: Math.floor(Date.now() / 1000)
  }

  policies.policy.signature = await signJwt(policyPayload, jwk)
}
