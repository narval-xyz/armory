import { ArmoryClientConfig, Permission, createArmoryConfig, generateWallet, sendEvaluationRequest, setEntities, setPolicies, signRequestPayload } from '@narval/armory-sdk'
import { Action, Decision } from '@narval/policy-engine-shared'
import { Hex, buildSignerForAlg, privateKeyToJwk, publicKeySchema } from '@narval/signature'
import { v4 } from 'uuid'

const rewardEngine = (players: {id: string, address: string}[], heros: {id: string, address: string}[]) => ({ rewards: {
  players: [{
    id: players[0].id,
    address: players[0].address,
    reward: 1000
  }],
  heros: [{
    id: heros[0].id,
    address: heros[0].address,
    reward: 2000
  }]
}})

const getFantasyDb = () => ({players: [{id: 'player-id', address: 'player-address'}], heros: [{id: 'hero-id', address: 'hero-address'}]})

const main = async () => {
  const fantasyDb = getFantasyDb()
  console.log(fantasyDb)

  const vaultClientId = process.env.ARMORY_VAULT_CLIENT_ID
  const authClientId = process.env.ARMORY_CLIENT_ID
  const authClientSecret = process.env.ARMORY_AUTH_SECRET
  const authHost = process.env.ARMORY_AUTH_HOST
  const vaultHost = process.env.ARMORY_VAULT_HOST
  const entityStoreHost = process.env.ARMORY_ENTITY_STORE_HOST
  const policyStoreHost = process.env.ARMORY_POLICY_STORE_HOST

  const adminKey = process.env.ARMORY_PRIVATE_KEY

  const adminJwk = privateKeyToJwk(adminKey as Hex)
  const signer = await buildSignerForAlg(adminJwk)

  const userSigner = {
    jwk: adminJwk,
    signer,
  }

  const config = {
    authClientId,
    authClientSecret,
    authHost,
    vaultClientId,
    vaultHost,
    entityStoreHost,
    policyStoreHost,
  } as ArmoryClientConfig


  const entityRes = await setEntities(config, {
    users: [{
      id: 'root-id',
      role: 'root',
    }],
    addressBook: [],
    wallets: [],
    credentials: [{
      id: v4(),
      userId: 'root-id',
      key: publicKeySchema.parse(adminJwk),
    }],
    walletGroupMembers: [],
    walletGroups: [],
    userWallets: [],
    userGroupMembers: [],
    userGroups: [],
    tokens: [],
  })

  const policyRes = await setPolicies(config, [
      {
        id: v4(),
        description: 'let root user create a wallet',
        when: [
          {
            criterion: 'checkAction',
            args: [Action.GRANT_PERMISSION]
          }
        ],
        then: 'permit'
      }
    ]
  )
  const evaluationRequest = await signRequestPayload({
    clientId: config.authClientId,
    jwk: userSigner.jwk,
    signer: userSigner.signer,
  }, {
    request: {
      action: Action.GRANT_PERMISSION,
      resourceId: 'vault',
      nonce: v4(),
      permissions: [ Permission.WALLET_CREATE ],
    },
    authentication: '',
  })

  const response = await sendEvaluationRequest({
    jwk: userSigner.jwk,
    signer: userSigner.signer,
    engineClientId: config.authClientId,
    engineHost: config.authHost,
    engineClientSecret: config.authClientSecret,
  }, evaluationRequest);

  if (response.decision === Decision.CONFIRM || response.decision === Decision.FORBID || !response.accessToken) {
    // handle unauthorized request in your system
    throw new Error('Failed to get access token');
  }

  const wallet = generateWallet({
    jwk: userSigner.jwk, 
    signer: userSigner.signer,
    vaultClientId: config.vaultClientId,
    vaultHost: config.vaultHost,
  }, {
    accessToken: response.accessToken
  })
  console.log(wallet);

  const rewards = rewardEngine(fantasyDb.players, fantasyDb.heros)

  console.log(rewards)
  console.log('done')
}

main()