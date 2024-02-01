import { convertEnums, convertEnumsArray } from '../../enum.util'

describe('convertEnums', () => {
  enum TestEnum {
    A = 'A',
    B = 'B'
  }
  enum TestEnum2 {
    X = 'X',
    Y = 'Y'
  }

  it('should convert enum values', () => {
    const data = { key1: 'A', key2: 'value2', key4: 'X' }
    const result = convertEnums({ key1: TestEnum, key4: TestEnum2 }, data)
    expect(result).toEqual({ key1: TestEnum.A, key2: 'value2', key4: TestEnum2.X })
  })

  it('should throw an error for invalid enum values', () => {
    const data = { key1: 'C', key2: 'value2' }
    expect(() => convertEnums({ key1: TestEnum }, data)).toThrow('Invalid enum value for key key1: C')
  })

  it('should leave non-enum values unchanged', () => {
    const data = { key1: 'A', key2: 'value2' }
    const result = convertEnums({ key1: TestEnum }, data)
    expect(result.key2).toBe('value2')
  })
})

describe('convertEnumsArray', () => {
  it('should convert an array of objects with enums', () => {
    enum TestEnum {
      A = 'A',
      B = 'B'
    }
    const data = [
      { key1: 'A', key2: 'value2' },
      { key1: 'B', key2: 'value2' }
    ]
    const result = convertEnumsArray({ key1: TestEnum }, data)
    expect(result).toEqual([
      { key1: TestEnum.A, key2: 'value2' },
      { key1: TestEnum.B, key2: 'value2' }
    ])
  })
})
