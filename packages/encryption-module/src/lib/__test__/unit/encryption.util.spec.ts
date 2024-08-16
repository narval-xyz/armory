import { generateKeyEncryptionKey } from '../../encryption.util'

describe('generateKeyEncryptionKey', () => {
  const password = 'test-password'
  const salt = 'test-salt'

  it('generates a standard kek from password and salt', () => {
    const kekOne = generateKeyEncryptionKey(password, salt)
    const kekTwo = generateKeyEncryptionKey(password, salt)

    expect(kekOne).toEqual(kekTwo)
    expect(kekOne.length).toEqual(32)
  })

  it('generates a kek with a custom length', () => {
    const kek = generateKeyEncryptionKey(password, salt, { length: 64 })

    expect(kek.length).toEqual(64)
  })
})
