import { Entities, EntityStore, PolicyStore, UserEntity } from '@narval/policy-engine-shared'
import { Alg, generateJwk } from '@narval/signature'
import { User, Wallet } from './models'

export const users = new Map<string, User>([
  ['matt', { id: 'matt', name: 'Matt', role: 'admin', walletIds: [], credential: {} }]
])
const userEntities: UserEntity[] = []
users.forEach((user) => {
  userEntities.push({ id: user.id, role: user.role })
})

export const wallets = new Map<string, Wallet>()
export const policies: PolicyStore = { data: [], signature: '' }
export const entities: EntityStore = {
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
