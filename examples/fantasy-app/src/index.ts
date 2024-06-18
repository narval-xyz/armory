import { ArmoryClientConfig, Permission, createArmoryConfig, generateAccount, generateWallet, getAuthorizationRequest, getEntities, sendAuthorizationRequest, sendEvaluationRequest, sendTransaction, setEntities, setPolicies, signRequest, signRequestPayload } from '@narval/armory-sdk'
import { AccountId, Action, Criterion, Decision, Entities, EntityType, EvaluationRequest, FiatCurrency, Policy, TransactionRequest, UserRole, ValueOperators, toAccountId } from '@narval/policy-engine-shared'
import { Alg, PrivateKey, PublicKey, generateJwk, getPublicKey, privateKeyToHex, publicKeyToHex, secp256k1PublicKeySchema } from '@narval/signature'
import { v4 } from 'uuid'
import { AbiParameter, Hex, createPublicClient, encodeAbiParameters, fromBytes, http, toHex } from 'viem'
import { buildSignerForAlg, privateKeyToJwk } from '@narval/signature'
import { delay } from 'lodash/fp'
import { multicall } from 'viem/_types/actions/public/multicall'
import { getChainOrThrow } from 'packages/armory-sdk/src/lib/utils'
import { Erc20TransferAbiParameters, Erc721SafeTransferFromAbiParameters, SupportedMethodId } from '@narval/transaction-request-intent'
import { containsNodeError, decodeAbiParameters } from 'viem/utils'

type Identification = {
  id: string,
  address: string,
}

type Erc20Reward = {
  amount: number,
  token: string,
}

type NftReward = {
  nftId: number,
  contract: Hex,
}

type Reward =  Identification & (Erc20Reward | NftReward)


const rewardEngine = (players: {id: string, address: string}[], heros: {id: string, address: string}[]): {
  players: Reward[],
  heros: Reward[],
} => ({
  players: [{
    id: players[0].id,
    address: players[0].address,
    amount: 1000,
    token: 'MATIC',
  }],
  heros: [{
    id: heros[0].id,
    address: heros[0].address,
    nftId: 2,
    contract: '0x4d544035500D7aC1B42329c70eb58E77f8249f0F',
  }]
})



const erc20TransferToPolicy = ({
  from,
  to,
  token,
  amount,
}: {
  from: Hex,
  to: Hex,
  token: string,
  amount: string,
}, description?: string): Policy => {
  return {
    id: v4(),
    description: description || `transfer ${amount} ${token} from ${from} to ${to}`,
    when: [
      {
        criterion: 'checkIntentType',
        args: ['transferErc20']
      },
      {
        criterion: 'checkIntentAmount',
        args: {
          operator: ValueOperators.LESS_THAN_OR_EQUAL,
          currency: '*',
          value: amount,
        }
      }
    ],
    then: 'permit',
  }
}

const erc721TransferToPolicy = ({
  from,
  to,
  nftIds,
  contract,
}: {
  from: Hex,
  to: Hex,
  nftIds: string[],
  contract: AccountId,
}, description?: string): Policy => {
  return {
    id: v4(),
    description: description || `transfer nft ${nftIds.join(', ')} from ${from} to ${to}`,
    when: [
      {
        criterion: Criterion.CHECK_INTENT_TYPE,
        args: ['transferErc721']
      },
    ],
    then: 'permit',
  }
}

const getFantasyDb = () => ({players: [{id: 'player-id', address: '0xf6035dA050D44153bc0D25729AEC270c2993BeE0'}], heros: [{id: 'hero-id', address: '0x9c874A1034275f4Aa960f141265e9bF86a5b1334'}]})

const main = async () => {  
  const authClientId = process.env.AUTH_CLIENT_ID  as string
  const authClientSecret = process.env.AUTH_CLIENT_SECRET  as string
  const authHost = process.env.AUTH_HOST as string

  const vaultClientId = process.env.VAULT_CLIENT_ID  as string
  const vaultHost = process.env.VAULT_HOST  as string

  const policyKey = process.env.POLICY_PRIVATE_KEY  as string
  const policyStoreHost = process.env.POLICY_DATA_HOST  as string
  
  const entityStoreHost = process.env.ENTITY_HOST  as string
  const entityKey = process.env.ENTITY_PRIVATE_KEY  as string
  const adminKey = process.env.ROOT_USER_PRIVATE_KEY  as string

  const rootJwk = privateKeyToJwk(adminKey as Hex)
  const rootSigner = await buildSignerForAlg(rootJwk)
  
  const entityJwk = privateKeyToJwk(entityKey as Hex)
  const entitySigner = await buildSignerForAlg(entityJwk)

  const policyJwk = privateKeyToJwk(policyKey as Hex)
  const policySigner = await buildSignerForAlg(policyJwk)

  const userSigner = {
    jwk: rootJwk,
    signer: rootSigner,
  }

  const entityRes = await setEntities({
    jwk: entityJwk,
    signer: entitySigner,
    entityStoreHost,
    policyStoreHost,
    dataStoreClientId: authClientId,
    dataStoreClientSecret: authClientSecret as string,
  }, {
    addressBook: [],
    credentials: [{
      id: rootJwk.kid,
      userId: 'root-id',
      key: secp256k1PublicKeySchema.parse(rootJwk) as PublicKey,
    }],
    tokens: [],
    userGroupMembers: [],
    userGroups: [],
    userWallets: [],
    users: [{
      id: 'root-id',
      role: 'root',
    }],
    walletGroupMembers: [],
    walletGroups: [],
    wallets: [],
  })

  console.log('entityRes', entityRes)

    const policyRes = await setPolicies({
      jwk: policyJwk,
      signer: policySigner,
      entityStoreHost,
      policyStoreHost,
      dataStoreClientId: authClientId,
      dataStoreClientSecret: authClientSecret as string,
  }, [
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

  console.log('policyRes', policyRes)

  // Sign the Authorization Request
  const evaluationRequest = await signRequestPayload({
    clientId: authClientId,
    jwk: rootJwk,
    signer: rootSigner,
  }, {
    request: {
      action: Action.GRANT_PERMISSION,
      resourceId: 'vault',
      nonce: v4(),
      permissions: [ Permission.WALLET_CREATE ],
    },
    approvals: [], // will be fixed, should be empty
    metadata: {
      issuer: `${authClientId}.armory.narval.xyz`, // will be fixed
    },
    authentication: '', // will be fixed, should be empty
  })

  console.log('evaluationRequest', evaluationRequest)

  // send the authorization request to Auth Server
  const response = await sendAuthorizationRequest({
    authClientSecret,
    authClientId,
    authHost,
    jwk: userSigner.jwk,
    signer: userSigner.signer,
  }, evaluationRequest)

  console.log('response', response)

  // Poll to get your evaluation result
  let res = await getAuthorizationRequest({
    authClientSecret,
    authClientId,
    authHost,
    jwk: userSigner.jwk,
    alg: userSigner.jwk.alg,
    signer: userSigner.signer,
  }, response.id)

  while (res.status === 'CREATED' || res.status === 'PROCESSING') {
    delay(1000); // Wait for 1 second
    res = await getAuthorizationRequest({
      authClientSecret,
      authClientId,
      authHost,
      jwk: userSigner.jwk,
      alg: userSigner.jwk.alg,
      signer: userSigner.signer,
    }, response.id);
  }

  if (res.status !== 'PERMITTED') {
    throw new Error('Permission Denied')
  }

  const keyId = `${v4()}-fantasy-app`
  const { evaluations } = res
  const wallet = await generateWallet({
    jwk: userSigner.jwk,
    signer: userSigner.signer,
    vaultClientId,
    vaultHost,
    alg: userSigner.jwk.alg,
  }, {
    accessToken: {
      value: evaluations[0].signature as string,
    },
    keyId,
  })
  const entities = await getEntities(entityStoreHost);
  const entitiesAndNewAccount: Entities = {
    ...entities.data,
    wallets: [
      ...entities.data.wallets,
      {
        id: wallet.account.id,
        address: wallet.account.address as Hex,
        accountType: 'eoa',
      }
    ],
  }
  await setEntities({
    jwk: entityJwk,
    signer: entitySigner,
    entityStoreHost,
    policyStoreHost,
    dataStoreClientId: authClientId,
    dataStoreClientSecret: authClientSecret as string,
  }, entitiesAndNewAccount)

  const { accounts } = await generateAccount({
    jwk: userSigner.jwk,
    signer: userSigner.signer,
    vaultClientId,
    vaultHost,
    alg: userSigner.jwk.alg,
  }, {
    accessToken: {
      value: evaluations[0].signature as string,
    },
    keyId,
     // notice that this is the same keyId as the one that was used to generate the wallet
     // account is derived from the wallet
  })

  const intiator = await generateJwk<PrivateKey>(Alg.ES256K)
  const intiatorPrivateKey = await privateKeyToHex(intiator)
  const intiatorPublicKey = getPublicKey(intiator)

  const entities2 = await getEntities(entityStoreHost);
  await setEntities({
    jwk: entityJwk,
    signer: entitySigner,
    entityStoreHost,
    policyStoreHost,
    dataStoreClientId: authClientId,
    dataStoreClientSecret: authClientSecret as string,
  }, {
    ...entities2.data,
    users: [
      ...entities2.data.users,
      {
        id: `initiator-${accounts[0].id}`,
        role: UserRole.MEMBER,
      }
    ],
    credentials: [
      ...entities2.data.credentials,
      {
        id: intiator.kid,
        userId: `initiator-${accounts[0].id}`,
        key: intiatorPublicKey as PublicKey,
      }
    ],
  });


  const db = getFantasyDb()
  const { players, heros } = rewardEngine(db.players, db.heros)


  const rewards = players.concat(heros)

  const rewardToPolicy = (reward: Reward): Policy => {
    if ('amount' in reward) {
      return erc20TransferToPolicy({
        from: accounts[0].address as Hex,
        to: reward.address as Hex,
        token: reward.token,
        amount: reward.amount.toString(),
      })
    } else if ('contract' in reward) {
      return erc721TransferToPolicy({
        from: accounts[0].address as Hex,
        to: reward.address as Hex,
        nftIds: [reward.nftId.toString()],
        contract: toAccountId({
          chainId: 1,
          address: reward.contract,
        }),
      })
    }
    throw new Error('Invalid Reward')
  }

  const policies = rewards.map(rewardToPolicy)

  await setPolicies({
    jwk: policyJwk,
    signer: policySigner,
    entityStoreHost,
    policyStoreHost,
    dataStoreClientId: authClientId,
    dataStoreClientSecret: authClientSecret as string,
  }, policies)


  const buildTransactionRequest = (data: Hex) => ({
    from: accounts[0].address as Hex,
    chainId: 1,
    to: '0x3f843E606C79312718477F9bC020F3fC5b7264C2'.toLowerCase() as Hex,
    data,
  })

  
  const buildErc20TransferAuthRequest = async (reward: Identification & Erc20Reward) => {
    const encodedParams = encodeAbiParameters(Erc20TransferAbiParameters,
      [reward.address as Hex, BigInt(reward.amount)]
    )
    console.log("###encodedParams", encodedParams)
    // add the function selector
    const data = `${SupportedMethodId.TRANSFER}${encodedParams.slice(10)}` as Hex

    console.log('encodedTransferParams', encodedParams)
    console.log('###data', data)

    const authRequest = await signRequestPayload({
      clientId: authClientId,
      jwk: rootJwk,
      signer: rootSigner,
    }, {
      request: {
        action: Action.SIGN_TRANSACTION,
        resourceId: accounts[0].id,
        nonce: v4(),
        transactionRequest: buildTransactionRequest(data),
      },
      approvals: [],
      metadata: {
        issuer: `${authClientId}.armory.narval.xyz`,
      },
      authentication: '',
    })
    return authRequest
  }


  const buildErc721TransferAuthRequest = async (reward: Identification & NftReward) => {
    const encodedParams = encodeAbiParameters(Erc721SafeTransferFromAbiParameters, [
      accounts[0].address as Hex,
      reward.address as Hex,
      reward.nftId,
    ]) as Hex
    console.log('encodedTransferParams', encodedParams)
    const parameters = decodeAbiParameters(Erc721SafeTransferFromAbiParameters, encodedParams)
    console.log('decodedTransferParams', parameters)
    const data = `${SupportedMethodId.SAFE_TRANSFER_FROM}${encodedParams.slice(10)}` as Hex

    const authRequest = await signRequestPayload({
      clientId: authClientId,
      jwk: rootJwk,
      signer: rootSigner,
    }, {
      request: {
        action: Action.SIGN_TRANSACTION,
        resourceId: accounts[0].id,
        nonce: v4(),
        transactionRequest: buildTransactionRequest(data),
      },
      approvals: [],
      authentication: '',
    })
    return authRequest
  }


  const intiatorSigner = await buildSignerForAlg(intiator)

  const authRequests = await Promise.all(rewards.map(async (reward) => {
    console.log('reward', reward)
    if ('amount' in reward) {
      return buildErc20TransferAuthRequest(reward)
    } else if ('contract' in reward) {
      return buildErc721TransferAuthRequest(reward)
    }
    throw new Error('Invalid Reward')
  }))

  console.log('authRequests', authRequests)

  const authResponses = await Promise.all(authRequests.map(async (authRequest) => {
    const response = await sendAuthorizationRequest({
      authClientSecret,
      authClientId,
      authHost,
      jwk: intiator,
      signer: intiatorSigner,
    }, authRequest)
    return response.id
  }))

  console.log('authResponses', authResponses)

  // poll for the evaluation results
  const authResults = await Promise.all(authResponses.map(async (id) => {
    let res = await getAuthorizationRequest({
      authClientSecret,
      authClientId,
      authHost,
      jwk: intiator,
      alg: intiator.alg,
      signer: intiatorSigner,
    }, id)

    while (res.status === 'CREATED' || res.status === 'PROCESSING') {
      delay(1000); // Wait for 1 second
      res = await getAuthorizationRequest({
        authClientSecret,
        authClientId,
        authHost,
        jwk: intiator,
        alg: intiator.alg,
        signer: intiatorSigner,
      }, id);
    }

    return res
  }))

  const unauthorizedTx = authResults.filter((res) => res.status !== 'PERMITTED')
  const authorizedTxs = authResults.filter((res) => res.status === 'PERMITTED')

  unauthorizedTx.forEach((tx) => {
    console.log('---- unauthorized transaction ----')
    console.log(JSON.stringify(tx, null, 2))
  })
  console.log('authorizedTxs', authorizedTxs)

  const signedTxs = await Promise.all(authorizedTxs.map(async (tx) => {
    if (tx.request.action === Action.SIGN_TRANSACTION && tx.status === 'PERMITTED') {
      const { signature } = await signRequest({
        vaultClientId,
        vaultHost,
        jwk: intiator,
        alg: intiator.alg,
        signer: intiatorSigner,
      }, {
        accessToken: {
          value: tx.evaluations[0].signature as string,
        },
        request: tx.request,
      })
      return {
        signature,
        txRequest: tx.request.transactionRequest,
      }
    }
    return null;
  }))

  const transactionHashes = await Promise.all(signedTxs.map(async (tx) => {
    if (tx) {
      const hash = await sendTransaction(tx.txRequest, tx.signature)
      return hash
    }
    return null
  }))

  console.log('transactionHashes', transactionHashes)
}

main()
