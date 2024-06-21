import { AddressIndex, resourceId } from '@narval/armory-sdk'
import { Curves, addressToKid, privateKeyToJwk, publicKeyToHex } from '@narval/signature'
import { HttpStatus } from '@nestjs/common'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import { max, range } from 'lodash/fp'
import { Hex, toHex } from 'viem'
import { privateKeyToAddress, publicKeyToAddress } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { BIP44_PREFIX } from '../../../shared/type/bip44.type'
import { Origin, PrivateAccount } from '../../../shared/type/domain.type'
import { GenerateWalletDto } from '../../http/rest/dto/generate-wallet.dto'

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
    suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    context: { key }
  })
}

export const findAddressIndexes = (path: (string | undefined)[]): number[] => {
  if (!path.length) {
    return []
  }
  const results = path.map((p) => {
    const parsedString = AddressIndex.safeParse(p)
    if (parsedString.success) {
      return parsedString.data
    }
    return undefined
  })
  return results.filter((index): index is number => index !== undefined)
}

export const hdKeyToAccount = async ({
  key,
  keyId,
  path
}: {
  key: HDKey
  keyId: string
  path: string
}): Promise<PrivateAccount> => {
  if (!key.privateKey) {
    throw new ApplicationException({
      message: 'HDKey does not have a private key',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
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
    origin: Origin.GENERATED,
    address,
    keyId,
    derivationPath: path
  }
}

export const generateNextPaths = (derivedIndexes: number[], count: number): string[] => {
  const maxIndex = max(derivedIndexes)
  const startIndex = maxIndex !== undefined ? maxIndex + 1 : 0
  return range(startIndex, startIndex + count).map((index) => `${BIP44_PREFIX}${index}`)
}

export const mnemonicToRootKey = (rootKey: string): HDKey => {
  const seed = mnemonicToSeedSync(rootKey)
  return HDKey.fromMasterSeed(seed)
}

export const getRootKey = (
  mnemonic: string,
  opts: GenerateWalletDto
): {
  rootKey: HDKey
  keyId: string
} => {
  const { curve = Curves.SECP256K1 } = opts
  switch (curve) {
    case Curves.SECP256K1: {
      const rootKey = mnemonicToRootKey(mnemonic)
      return { rootKey, keyId: opts.keyId || hdKeyToKid(rootKey) }
    }
    default:
      throw new ApplicationException({
        message: 'Unsupported curve',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: { curve: opts.curve }
      })
  }
}

export type HDkey = HDKey
