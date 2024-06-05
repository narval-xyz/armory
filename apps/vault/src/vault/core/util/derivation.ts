import { HttpStatusCode } from 'axios';
import { NarvalSdkException } from '../../../../../../packages/armory-sdk/src/lib/exceptions';
import { Bip44Path, Bip44Options } from '../../../../../../packages/armory-sdk/src/lib/types/vault'
import { registeredCoinTypes } from 'slip44';

const ETH = 60

export const isBip44Path = (path?: string): path is Bip44Path => Bip44Path.safeParse(path).success

export const bip44Path = (opts: Bip44Options): Bip44Path => {
  const { coinType = ETH, accountIndex = 0, addressIndex = 0, changeIndex = 0, path } = opts
  if (!isBip44Path(path)) {
    throw new NarvalSdkException('Invalid derivation path', 
      {
        code: HttpStatusCode.UnprocessableEntity,
        context: {
          derivationOptions: opts,
          coinType,
          accountIndex,
          addressIndex,
          changeIndex
        }
      }
    )
  }
  if (!registeredCoinTypes.find((type) => type[0] === coinType)) {
    throw new NarvalSdkException(`Invalid coin type: ${coinType}`, 
      {
        code: HttpStatusCode.UnprocessableEntity,
        context: {
          derivationOptions: opts,
          coinType,
          accountIndex,
          addressIndex,
          changeIndex
        }
      }
    )
  }
  return path || `m/44'/${coinType}'/${accountIndex}'/${changeIndex}/${addressIndex}`
}

export const nextBip44Path = (path?: Bip44Path): Bip44Path => {
  if (!path) {
    return bip44Path({})
  }
  const [_, coinType, accountIndex, changeIndex, addressIndex] = path.split('/')
  return bip44Path({
    coinType: parseInt(coinType),
    accountIndex: parseInt(accountIndex),
    changeIndex: parseInt(changeIndex),
    addressIndex: parseInt(addressIndex) + 1
  })
}
