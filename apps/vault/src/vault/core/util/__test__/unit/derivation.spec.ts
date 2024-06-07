import { bip44Path, nextBip44Path } from '../../derivation'

describe('bip44Path', () => {
  it('returns the default derivation path if no options are provided', () => {
    const expectedPath = "m/44'/60'/0'/0/0"
    const result = bip44Path({})
    expect(result).toEqual(expectedPath)
  })

  it('throws if the provided derivation path uses account index', () => {
    const expectedPath = "m/44'/60'/1'/0/0"
    try {
      bip44Path({ path: expectedPath })
    } catch (error) {
      expect(error.message).toEqual('Invalid bip44 path')
    }
  })

  it('returns the derived derivation path based on the provided options', () => {
    const expectedPath = "m/44'/60'/0'/0/3"
    const result = bip44Path({ addressIndex: 3 })
    expect(result).toEqual(expectedPath)
  })

  it('throws an error if the derivation path is invalid', () => {
    const invalidPath = "m/44'/60'/1'/2/3/4"
    try {
      bip44Path({ path: invalidPath })
    } catch (error) {
      expect(error.message).toEqual('Invalid bip44 path')
    }
  })

  it('returns the path if it is valid', () => {
    const validPath = "m/44'/60'/0'/0/3"
    const result = bip44Path({ path: validPath })
    expect(result).toEqual(validPath)
  })
})

describe('nextBip44Path', () => {
  it('returns the next derivation path based on the provided path', () => {
    const currentPath = "m/44'/60'/0'/0/3"
    const expectedPath = "m/44'/60'/0'/0/4"
    const result = nextBip44Path(currentPath)
    expect(result).toEqual(expectedPath)
  })

  it('returns the default derivation path if no path is provided', () => {
    const expectedPath = "m/44'/60'/0'/0/0"
    const result = nextBip44Path()
    expect(result).toEqual(expectedPath)
  })
})
