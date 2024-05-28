import { FIXTURE, toBytes } from '@narval/policy-engine-shared'
import { publicKeyToHex } from '@narval/signature'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import { ApplicationException } from '../../../../../shared/exception/application.exception'
import { Origin } from '../../../../../shared/type/domain.type'
import { buildDerivationPath, deriveWallet, hdKeyToKid, hdKeyToWallet, mnemonicToRootKey } from '../../key-generation'

const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
const seed = mnemonicToSeedSync(mnemonic)
const rootKey = HDKey.fromMasterSeed(seed)

const rootKeyWallet = {
  id: 'eip155:eoa:0xcfad06bec03d2769fc4fe6055b7a55dbb05edc33',
  address: '0xcfad06bec03d2769fc4fe6055b7a55dbb05edc33',
  privateKey: '0x7e56ecf5943d79e1f5f87e11c768253d7f3fcf30ae71335611e366c578b4564e',
  publicKey:
    '0x04c4c9a1e37f5601ed4c7d0eb202e0b55e7891c4787853bef6c3b96a187de12d832f1708c453f47839e3f80a6f2a892a74f95e663902cf277b0b992a1e55ff8a8e',
  origin: Origin.GENERATED,
  keyId: 'root-key-id',
  derivationPath: 'm'
}

const firstDerivedWallet = {
  privateKey: '0x33fa40f84e854b941c2b0436dd4a256e1df1cb41b9c1c0ccc8446408c19b8bf9',
  publicKey:
    '0x04a70d1ef368ad99e90d509496e9888ee7404e4f4d360376bf521d769cf0c4de46902ab6f9d90af66773b6ead2fe3a0a1cb3225697d1617b1f2d37f493988d867d',
  address: '0x58a57ed9d8d624cbd12e2c467d34787555bb1b25',
  origin: Origin.GENERATED,
  id: 'eip155:eoa:0x58a57ed9d8d624cbd12e2c467d34787555bb1b25',
  keyId: '0x1ad67053dbaa34a78b8f1ce6151677881c79971394d570f7c8fca24bdff7d4f5',
  derivationPath: "m/44'/60'/0'/0/0"
}
describe('hdKeyToWallet', () => {
  it('convert HDKey to Wallet', async () => {
    const path = 'm'
    const rootKeyId = 'root-key-id'

    const wallet = await hdKeyToWallet(rootKey, path, rootKeyId)
    expect(wallet).toEqual(rootKeyWallet)
  })
})

describe('buildDerivationPath', () => {
  it('returns  the default derivation path if no options are provided', () => {
    const expectedPath = "m/44'/60'/0'/0/0"
    const result = buildDerivationPath({})
    expect(result).toEqual(expectedPath)
  })

  it('returns  the provided derivation path if it is specified in the options', () => {
    const expectedPath = "m/44'/60'/1'/0/0"
    const result = buildDerivationPath({ path: expectedPath })
    expect(result).toEqual(expectedPath)
  })

  it('returns  the derived derivation path based on the provided options', () => {
    const expectedPath = "m/44'/60'/1'/2/3"
    const result = buildDerivationPath({ accountIndex: 1, changeIndex: 2, addressIndex: 3 })
    expect(result).toEqual(expectedPath)
  })
})

describe('hdKeyToKid', () => {
  it('returns  the kid based on the private key', () => {
    const expectedKid = '0x1ad67053dbaa34a78b8f1ce6151677881c79971394d570f7c8fca24bdff7d4f5'
    const result = hdKeyToKid(rootKey)
    expect(result).toEqual(expectedKid)
  })

  it('returns  the kid based on the public key', async () => {
    const key = new HDKey({
      publicKey: toBytes(await publicKeyToHex(FIXTURE.PUBLIC_KEYS_JWK.Root))
    })
    const expectedKid = '0x11857c371ab71b7e19132a7e741ab06f2c6bb0b1d1bc814f3f5239b6aa9f014d'

    const result = hdKeyToKid(key)
    expect(result).toEqual(expectedKid)
  })

  it('throws an error if the HDKey does not have a private key', async () => {
    try {
      await hdKeyToWallet({} as unknown as HDKey, buildDerivationPath({}), 'kid')
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException)
      expect(error.message).toEqual('HDKey does not have a private key')
    }
  })
})
describe('deriveWallet', () => {
  const rootKey = HDKey.fromMasterSeed(seed)

  it('derives a wallet using the default derivation path if no options are provided', async () => {
    const expectedPath = "m/44'/60'/0'/0/0"
    const expectedWallet = firstDerivedWallet

    const wallet = await deriveWallet(rootKey)
    expect(wallet).toEqual(expectedWallet)
    expect(wallet.derivationPath).toEqual(expectedPath)
  })

  it('derives a wallet using the provided derivation path if it is specified in the options', async () => {
    const expectedPath = "m/44'/60'/1'/0/0"
    const expectedWallet = {
      address: '0x44f649fc8dc77694e6abef1aa966983dd6ed7c64',
      derivationPath: expectedPath,
      id: 'eip155:eoa:0x44f649fc8dc77694e6abef1aa966983dd6ed7c64',
      origin: Origin.GENERATED,
      keyId: '0x1ad67053dbaa34a78b8f1ce6151677881c79971394d570f7c8fca24bdff7d4f5',
      privateKey: '0x27a90cf98885ff2b32a953b3e3d07f5bd62009d3fbd816053daa30245f2429a4',
      publicKey:
        '0x042f2c59992e1c4e6299fcd6f161e7ae7e8c48639a43df5a5a83f5fd9a8f62563a421768a55eead3ee748c13b64fd109f5e067dd360d2f52c5d7acbfcb09fb48c4'
    }

    const wallet = await deriveWallet(rootKey, { path: expectedPath })
    expect(wallet).toEqual(expectedWallet)
    expect(wallet.derivationPath).toEqual(expectedPath)
  })

  it('derives a wallet using the derived derivation path based on the provided options', async () => {
    const expectedPath = "m/44'/60'/1'/2/3"
    const expectedWallet = {
      derivationPath: expectedPath,
      address: '0xd12e72de1e1408e2494bbe59f4a689cac38c09a8',
      id: 'eip155:eoa:0xd12e72de1e1408e2494bbe59f4a689cac38c09a8',
      keyId: '0x1ad67053dbaa34a78b8f1ce6151677881c79971394d570f7c8fca24bdff7d4f5',
      origin: Origin.GENERATED,
      privateKey: '0xf57a70f903e259db662e2209602a16d6496b8510917a82f26827a7a6f1fe8072',
      publicKey:
        '0x041c14ab957db11eca8241b4c5d34b2b0de1a23aaddb86c0ae7c87bce02e85b7f3ab1f390378d25c934363495abc308a81db7dc66cec6f76b378407744de866e50'
    }

    const wallet = await deriveWallet(rootKey, { accountIndex: 1, changeIndex: 2, addressIndex: 3 })
    expect(wallet).toEqual(expectedWallet)
    expect(wallet.derivationPath).toEqual(expectedPath)
  })

  it('derives a wallet using the provided rootKeyId if it is specified in the options', async () => {
    const expectedRootKeyId = 'custom-root-key-id'
    const expectedWallet = {
      ...firstDerivedWallet,
      keyId: expectedRootKeyId
    }

    const wallet = await deriveWallet(rootKey, { rootKeyId: expectedRootKeyId })
    expect(wallet).toEqual(expectedWallet)
    expect(wallet.keyId).toEqual(expectedRootKeyId)
  })
})

describe('mnemonicToRootKey', () => {
  it('converts mnemonic to root key', () => {
    const expectedRootKey = rootKey
    const result = mnemonicToRootKey(mnemonic)
    expect(result).toEqual(expectedRootKey)
  })
})
