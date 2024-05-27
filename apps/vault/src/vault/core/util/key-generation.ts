import { addressToKid, privateKeyToJwk, publicKeyToHex } from '@narval/signature'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import { resourceId } from 'packages/armory-sdk/src/lib/utils'
import { HDOptions, Hex, toHex } from 'viem'
import { privateKeyToAddress, publicKeyToAddress } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { PrivateWallet } from '../../../shared/type/domain.type'

type DeriveOptions = HDOptions & { rootKeyId?: string }

export const buildDerivationPath = (opts: HDOptions) => {
  const { accountIndex = 0, addressIndex = 0, changeIndex = 0, path } = opts
  return path || `m/44'/60'/${accountIndex}'/${changeIndex}/${addressIndex}`
}

export const hdKeyToKid = (key: HDKey): string => {
  if (key.privateKey) {
    const privateKey = toHex(key.privateKey).toLowerCase() as Hex
    const address = privateKeyToAddress(privateKey).toLowerCase() as Hex

    return addressToKid(address)
  }

  if (key.publicKey) {
    const publicKey = toHex(key.publicKey).toLowerCase() as Hex
    const address = publicKeyToAddress(publicKey).toLowerCase() as Hex

    return addressToKid(address)
  }

  throw new ApplicationException({
    message: 'HDKey does not have a private or a public key',
    suggestedHttpStatusCode: 500,
    context: { key }
  })
}

export const hdKeyToWallet = async (key: HDKey, path: string, kid: string): Promise<PrivateWallet> => {
  if (!key.privateKey) {
    throw new ApplicationException({
      message: 'HDKey does not have a private key',
      suggestedHttpStatusCode: 500,
      context: { key }
    })
  }

  const privateKey = toHex(key.privateKey).toLowerCase() as Hex
  const address = privateKeyToAddress(privateKey).toLowerCase() as Hex
  const privateJwk = privateKeyToJwk(privateKey)
  const publicKey = await publicKeyToHex(privateJwk)

  return {
    id: resourceId(address),
    privateKey,
    publicKey,
    address,
    keyId: kid,
    derivationPath: path
  }
}

export const mnemonicToRootKey = (mnemonic: string): HDKey => {
  const seed = mnemonicToSeedSync(mnemonic)
  return HDKey.fromMasterSeed(seed)
}

export const deriveWallet = async (rootKey: HDKey, opts: DeriveOptions = {}): Promise<PrivateWallet> => {
  const path = buildDerivationPath(opts)
  const derivedKey = rootKey.derive(path)
  const wallet = await hdKeyToWallet(derivedKey, path, opts.rootKeyId || hdKeyToKid(rootKey))
  return wallet
}
