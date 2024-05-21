import { addressToKid, privateKeyToJwk, publicKeyToHex } from '@narval/signature'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import { resourceId } from 'packages/armory-sdk/src/lib/utils'
import { HDOptions, Hex, toHex } from 'viem'
import { privateKeyToAddress } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Wallet } from '../../../shared/type/domain.type'

export const buildDerivePath = (opts: HDOptions) => {
  const { accountIndex = 0, addressIndex = 0, changeIndex = 0, path } = opts
  return path || `m/44'/60'/${accountIndex}'/${changeIndex}/${addressIndex}`
}

export const HdKeyToWallet = async (key: HDKey, path: string): Promise<Wallet> => {
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
  const keyId = addressToKid(address)

  return {
    id: resourceId(address),
    privateKey,
    publicKey,
    address,
    keyId,
    derivationPath: path
  }
}

export const mnemonicToWallet = async (mnemonic: string, opts: HDOptions = {}): Promise<Wallet> => {
  const seed = mnemonicToSeedSync(mnemonic)
  const hdKey = HDKey.fromMasterSeed(seed)
  const path = buildDerivePath(opts)
  const derivedKey = hdKey.derive(path)
  const wallet = await HdKeyToWallet(derivedKey, path)
  return wallet
}
