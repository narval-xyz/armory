import { Permission, resourceId } from '@narval/armory-sdk'
import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import {
  Alg,
  Curves,
  Payload,
  RsaPublicKey,
  SMALLEST_RSA_MODULUS_LENGTH,
  SigningAlg,
  buildSignerEip191,
  generateJwk,
  rsaDecrypt,
  rsaEncrypt,
  rsaPublicKeySchema,
  secp256k1PrivateKeyToJwk,
  secp256k1PrivateKeyToPublicJwk,
  signJwt
} from '@narval/signature'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { TestingModule } from '@nestjs/testing'
import { generateMnemonic } from '@scure/bip39'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { english } from 'viem/accounts'
import { VaultTest } from '../../../__test__/shared/vault.test'
import { ClientService } from '../../../client/core/service/client.service'
import { MainModule } from '../../../main.module'
import { ProvisionService } from '../../../provision.service'
import { TestPrismaService } from '../../../shared/module/persistence/service/test-prisma.service'
import { Client, Origin } from '../../../shared/type/domain.type'
import { ImportService } from '../../core/service/import.service'
import { KeyGenerationService } from '../../core/service/key-generation.service'

const PRIVATE_KEY = '0x7cfef3303797cbc7515d9ce22ffe849c701b0f2812f999b0847229c47951fca5'

describe('Generate', () => {
  let app: INestApplication
  let module: TestingModule
  let testPrismaService: TestPrismaService
  let provisionService: ProvisionService
  let clientService: ClientService
  let keyGenService: KeyGenerationService
  let importService: ImportService

  const clientId = uuid()

  // Engine key used to sign the approval request
  const enginePrivateJwk = secp256k1PrivateKeyToJwk(PRIVATE_KEY)
  const clientPublicJWK = secp256k1PrivateKeyToPublicJwk(PRIVATE_KEY)

  const client: Client = {
    clientId,
    auth: {
      disabled: false,
      local: {
        jwsd: {
          maxAge: 600,
          requiredComponents: ['htm', 'uri', 'created', 'ath']
        },
        allowedUsersJwksUrl: null,
        allowedUsers: null
      },
      tokenValidation: {
        disabled: false,
        url: null,
        jwksUrl: null,
        verification: {
          audience: null,
          issuer: 'https://armory.narval.xyz',
          maxTokenAge: 300,
          requireBoundTokens: false, // DO NOT REQUIRE BOUND TOKENS; we're testing both payload.cnf bound tokens and unbound here.
          allowBearerTokens: false,
          allowWildcard: null
        },
        pinnedPublicKey: clientPublicJWK
      }
    },
    name: 'test-client',
    configurationSource: 'dynamic',
    backupPublicKey: null,
    baseUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const getAccessToken = async (permissions: Permission[], opts: object = {}) => {
    const payload: Payload = {
      sub: 'test-root-user-uid',
      iss: 'https://armory.narval.xyz',
      iat: Math.floor(Date.now() / 1000),
      access: [
        {
          resource: 'vault',
          permissions
        }
      ],
      ...opts
    }
    const signer = buildSignerEip191(PRIVATE_KEY)

    return signJwt(payload, enginePrivateJwk, { alg: SigningAlg.EIP191 }, signer)
  }

  beforeAll(async () => {
    module = await VaultTest.createTestingModule({
      imports: [MainModule]
    }).compile()

    app = module.createNestApplication({ logger: false })

    testPrismaService = module.get<TestPrismaService>(TestPrismaService)
    clientService = module.get<ClientService>(ClientService)
    keyGenService = module.get<KeyGenerationService>(KeyGenerationService)
    importService = module.get<ImportService>(ImportService)
    provisionService = module.get<ProvisionService>(ProvisionService)

    await app.init()
  })

  afterAll(async () => {
    await testPrismaService.truncateAll()
    await module.close()
    await app.close()
  })

  beforeEach(async () => {
    await testPrismaService.truncateAll()

    await provisionService.provision()

    await clientService.save(client)
  })

  describe('GET /wallets', () => {
    it('responds with a list of wallets by client', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_READ])
      const secondClientId = uuid()
      await clientService.save({
        ...client,
        clientId: secondClientId
      })

      const { keyId: firstKeyId } = await keyGenService.generateWallet(clientId, {
        keyId: 'first-keyId',
        curve: Curves.SECP256K1
      })

      await keyGenService.generateWallet(secondClientId, {
        keyId: 'second-keyId',
        curve: Curves.SECP256K1
      })

      const seed = generateMnemonic(english)
      const pubKey = await importService.generateEncryptionKey(clientId)
      const encryptedSeed = await rsaEncrypt(seed, pubKey)
      const importedWallet = await importService.importSeed(clientId, {
        encryptedSeed,
        keyId: 'imported-keyId',
        curve: Curves.SECP256K1
      })

      const expectedFirstClientWallets = [
        {
          keyId: firstKeyId,
          origin: Origin.GENERATED,
          curve: Curves.SECP256K1,
          keyType: 'local'
        },
        {
          keyId: importedWallet.keyId,
          origin: Origin.IMPORTED,
          curve: Curves.SECP256K1,
          keyType: 'local'
        }
      ]

      const { body: firstClientGetRequest } = await request(app.getHttpServer())
        .get('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send()

      expect(firstClientGetRequest).toEqual({ wallets: expectedFirstClientWallets })
    })
  })

  describe('POST /wallets', () => {
    it('generates a new rootKey', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      const { body } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      expect(body.account).toEqual({
        keyId: 'keyId',
        derivationPath: "m/44'/60'/0'/0/0",
        address: expect.any(String),
        publicKey: expect.any(String),
        id: expect.any(String),
        origin: Origin.GENERATED
      })
    })

    it('saves a backup when client got a backupKey', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])
      const keyId = 'backupKeyId'
      const backupKey = await generateJwk(Alg.RS256, {
        keyId,
        modulusLength: SMALLEST_RSA_MODULUS_LENGTH
      })

      const clientWithBackupKey: Client = {
        ...client,
        clientId: uuid(),
        backupPublicKey: rsaPublicKeySchema.parse(backupKey)
      }
      await clientService.save(clientWithBackupKey)

      const { body } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientWithBackupKey.clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const decryptedMnemonic = await rsaDecrypt(body.backup as string, backupKey)
      const spaceInMnemonic = decryptedMnemonic.split(' ')
      expect(spaceInMnemonic.length).toBe(12)
    })

    it('responds with conflict when keyId already exists', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_CREATE])

      await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      const { status } = await request(app.getHttpServer())
        .post('/wallets')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({
          keyId: 'keyId'
        })

      expect(status).toEqual(HttpStatus.CONFLICT)
    })
  })

  describe('POST /wallets/import', () => {
    it('imports a jwe-encrypted rootKey', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_IMPORT])
      const { body: keygenBody } = await request(app.getHttpServer())
        .post('/encryption-keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({})

      const rsPublicKey: RsaPublicKey = rsaPublicKeySchema.parse(keygenBody.publicKey)

      const rootKey = generateMnemonic(english)
      const jwe = await rsaEncrypt(rootKey, rsPublicKey)

      const { status, body } = await request(app.getHttpServer())
        .post('/wallets/import')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('Authorization', `GNAP ${await getAccessToken([Permission.WALLET_IMPORT])}`)
        .send({
          encryptedSeed: jwe,
          keyId: 'my-imported-rootKey'
        })

      expect(body).toEqual({
        account: {
          address: expect.any(String),
          publicKey: expect.any(String),
          keyId: 'my-imported-rootKey',
          derivationPath: `m/44'/60'/0'/0/0`,
          id: resourceId(body.account.address),
          origin: Origin.GENERATED
        },
        keyId: 'my-imported-rootKey'
      })
      expect(status).toEqual(HttpStatus.CREATED)
    })

    it('responds with conflict when importing a seed with an existing keyId', async () => {
      const accessToken = await getAccessToken([Permission.WALLET_IMPORT])
      const { body: keygenBody } = await request(app.getHttpServer())
        .post('/encryption-keys')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('authorization', `GNAP ${accessToken}`)
        .send({})

      const rsPublicKey: RsaPublicKey = rsaPublicKeySchema.parse(keygenBody.publicKey)

      const rootKey = generateMnemonic(english)
      const jwe = await rsaEncrypt(rootKey, rsPublicKey)

      await request(app.getHttpServer())
        .post('/wallets/import')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('Authorization', `GNAP ${await getAccessToken([Permission.WALLET_IMPORT])}`)
        .send({
          encryptedSeed: jwe,
          keyId: 'my-imported-rootKey'
        })

      const { status } = await request(app.getHttpServer())
        .post('/wallets/import')
        .set(REQUEST_HEADER_CLIENT_ID, clientId)
        .set('Authorization', `GNAP ${await getAccessToken([Permission.WALLET_IMPORT])}`)
        .send({
          encryptedSeed: jwe,
          keyId: 'my-imported-rootKey'
        })

      expect(status).toEqual(HttpStatus.CONFLICT)
    })
  })
})
