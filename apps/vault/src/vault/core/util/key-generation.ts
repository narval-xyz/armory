import { addressToKid, privateKeyToJwk, publicKeyToHex } from '@narval/signature'
import { HDKey } from '@scure/bip32'
import { mnemonicToSeedSync } from '@scure/bip39'
import { Hex, toHex } from 'viem'
import { privateKeyToAddress, publicKeyToAddress } from 'viem/accounts'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { Origin, PrivateWallet } from '../../../shared/type/domain.type'
import { resourceId } from 'packages/armory-sdk/src/lib/utils/domain'
import { max } from 'lodash/fp'
import { isBip44Path, nextBip44Path } from 'apps/vault/src/vault/core/util/derivation'

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

export const hdKeyToWallet = async ({
  key,
  rootKeyId,
  path
}: {
  key: HDKey
  rootKeyId: string
  path: string
}): Promise<PrivateWallet> => {
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
    origin: Origin.GENERATED,
    address,
    rootKeyId,
    derivationPath: path
  }
}

export const deriveWallet = async (rootKey: HDKey, {
  rootKeyId,
  path,
}: {
  rootKeyId?: string
  path?: string
} = {}): Promise<PrivateWallet> => {
  rootKeyId = rootKeyId ?? hdKeyToKid(rootKey);
  path = path ?? nextBip44Path();

  const derivedKey = rootKey.derive(path);
  const wallet = await hdKeyToWallet({
    key: derivedKey,
    rootKeyId,
    path
  });
  return wallet;
}

export const mnemonicToRootKey = (mnemonic: string): HDKey => {
  const seed = mnemonicToSeedSync(mnemonic)
  return HDKey.fromMasterSeed(seed)
}

export const getRootKey = (
  mnemonic: string,
  keyId?: string
): {
  rootKey: HDKey
  keyId: string
} => {
  const rootKey = mnemonicToRootKey(mnemonic)
  return { rootKey, keyId: keyId || hdKeyToKid(rootKey) }
}

export const findNextPath = (paths: (string | undefined)[]): string => {
  const lastPath = max(paths.filter(isBip44Path));
  if (isBip44Path(lastPath) || lastPath === undefined) {
    return nextBip44Path(lastPath);
  }
}

export type HDkey = HDKey
