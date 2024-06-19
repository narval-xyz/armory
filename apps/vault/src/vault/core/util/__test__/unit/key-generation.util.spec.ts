import { FIXTURE, toBytes } from '@narval/policy-engine-shared'
import { publicKeyToHex } from '@narval/signature'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import { ApplicationException } from '../../../../../shared/exception/application.exception'
import { Origin } from '../../../../../shared/type/domain.type'
import { generateNextPaths, hdKeyToAccount, hdKeyToKid, mnemonicToRootKey } from '../../key-generation.util'

const mnemonic = 'legal winner thank year wave sausage worth useful legal winner thank yellow'
const seed = mnemonicToSeedSync(mnemonic)
const rootKey = HDKey.fromMasterSeed(seed)

const rootKeyAccount = {
  id: 'eip155:eoa:0xcfad06bec03d2769fc4fe6055b7a55dbb05edc33',
  address: '0xcfad06bec03d2769fc4fe6055b7a55dbb05edc33',
  privateKey: '0x7e56ecf5943d79e1f5f87e11c768253d7f3fcf30ae71335611e366c578b4564e',
  publicKey:
    '0x04c4c9a1e37f5601ed4c7d0eb202e0b55e7891c4787853bef6c3b96a187de12d832f1708c453f47839e3f80a6f2a892a74f95e663902cf277b0b992a1e55ff8a8e',
  origin: Origin.GENERATED,
  keyId: 'root-key-id',
  derivationPath: 'm'
}

describe('hdKeyToAccount', () => {
  it('convert HDKey to Account', async () => {
    const path = 'm'
    const keyId = 'root-key-id'

    const account = await hdKeyToAccount({ key: rootKey, path, keyId })
    expect(account).toEqual(rootKeyAccount)
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
      await hdKeyToAccount({
        key: {} as unknown as HDKey,
        path: 'm',
        keyId: 'kid'
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationException)
      expect(error.message).toEqual('HDKey does not have a private key')
    }
  })
})

describe('rootKeyToRootKey', () => {
  it('converts rootKey to root key', () => {
    const expectedRootKey = rootKey
    const result = mnemonicToRootKey(mnemonic)
    expect(result).toEqual(expectedRootKey)
  })
})

describe('generateNextPaths', () => {
  it('returns an array of next paths', () => {
    const derivedIndexes = [0, 1, 2]
    const count = 3
    const expectedPaths = [`m/44'/60'/0'/0/3`, `m/44'/60'/0'/0/4`, `m/44'/60'/0'/0/5`]

    const result = generateNextPaths(derivedIndexes, count)

    expect(result).toEqual(expectedPaths)
  })

  it('returns an array of next paths starting from 0 if no derived indexes are provided', () => {
    const derivedIndexes: number[] = []
    const count = 3
    const expectedPaths = [`m/44'/60'/0'/0/0`, `m/44'/60'/0'/0/1`, `m/44'/60'/0'/0/2`]

    const result = generateNextPaths(derivedIndexes, count)

    expect(result).toEqual(expectedPaths)
  })

  it('returns an empty array if count is 0', () => {
    const derivedIndexes = [0, 1, 2]
    const count = 0
    const expectedPaths: string[] = []

    const result = generateNextPaths(derivedIndexes, count)

    expect(result).toEqual(expectedPaths)
  })
})
