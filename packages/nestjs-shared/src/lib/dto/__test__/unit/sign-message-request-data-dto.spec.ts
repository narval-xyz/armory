import { Action, toHex } from '@narval/policy-engine-shared'
import { Hex } from '@narval/signature'
import { validateSync } from 'class-validator'
import { SignMessageRequestDataDto } from '../../sign-message-request-data-dto'

describe('SignMessageRequestDataDto', () => {
  it('should validate a valid SignMessageRequestDataDto object', () => {
    const dto = new SignMessageRequestDataDto()
    dto.action = Action.SIGN_MESSAGE
    dto.nonce = 'xxx'
    dto.resourceId = 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
    dto.message = 'My ASCII message'

    const errors = validateSync(dto)

    expect(errors).toEqual([])
    expect(errors.length).toBe(0)
  })

  it('should not validate an invalid SignMessageRequestDataDto object', () => {
    const dto = new SignMessageRequestDataDto()
    dto.nonce = 'xxx'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dto.action = 'invalid-action' as any // Invalid action value
    dto.resourceId = 'invalid-resource-id' // Invalid resourceId value
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dto.message = 123 as any // Invalid message value

    const errors = validateSync(dto)

    expect(errors.length).toBeGreaterThan(0)
  })

  it('validates nested raw message', () => {
    const dto = new SignMessageRequestDataDto()
    dto.nonce = 'xxx'
    dto.action = Action.SIGN_MESSAGE
    dto.resourceId = 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
    dto.message = { raw: toHex('My ASCII message') }

    const errors = validateSync(dto)

    expect(errors.length).toBe(0)
  })

  it('validates nested raw message must be hex', () => {
    const dto = new SignMessageRequestDataDto()
    dto.nonce = 'xxx'
    dto.action = Action.SIGN_MESSAGE
    dto.resourceId = 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
    dto.message = { raw: 'My ASCII message' as Hex }

    const errors = validateSync(dto)

    expect(errors.length).toBe(1)
  })
})
