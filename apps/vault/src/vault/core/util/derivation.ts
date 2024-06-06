import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { BIP44_PREFIX, Bip44Index, Bip44Options, Bip44Path } from '../../../shared/type/domain.type'

export const findBip44Indexes = (path: (string | undefined)[]): number[] => {
  if (!path.length) {
    return []
  }
  const results = path.map((p) => {
    const parsedString = Bip44Index.safeParse(p)
    if (parsedString.success) {
      return parsedString.data
    }
  })
  return results.filter((index): index is number => index !== undefined)
}

export const bip44Path = (opts: Bip44Options): Bip44Path => {
  const { addressIndex = 0, path } = opts
  if (path) {
    try {
      return Bip44Path.parse(path)
    } catch (error) {
      throw new ApplicationException({
        message: 'Invalid bip44 path',
        suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        context: {
          error,
          path
        }
      })
    }
  }
  return `${BIP44_PREFIX}${addressIndex}`
}

export const nextBip44Path = (path?: Bip44Path): Bip44Path => {
  if (!path) {
    return bip44Path({})
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const [_m, _purpose, _coinType, _accountIndex, _changeIndex, addressIndex] = path.split('/')
  /* eslint-enable @typescript-eslint/no-unused-vars */
  return bip44Path({
    addressIndex: parseInt(addressIndex) + 1
  })
}
