import { REQUEST_HEADER_CLIENT_ID } from '@narval/nestjs-shared'
import { ExecutionContext } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Request } from 'express'
import { MockProxy, mock } from 'jest-mock-extended'
import { NonceService } from '../../../../vault/core/service/nonce.service'
import { ApplicationException } from '../../../exception/application.exception'
import { NonceGuard } from '../../nonce.guard'

const mockExecutionContext = (req?: Partial<Request>) => {
  return {
    switchToHttp: () => ({
      getRequest: () => (req || {}) as Request
    })
  } as ExecutionContext
}

describe(NonceGuard.name, () => {
  let guard: NonceGuard
  let nonceServiceMock: MockProxy<NonceService>

  beforeEach(async () => {
    nonceServiceMock = mock<NonceService>()

    const module = await Test.createTestingModule({
      providers: [
        NonceGuard,
        {
          provide: NonceService,
          useValue: nonceServiceMock
        }
      ]
    }).compile()

    guard = module.get<NonceGuard>(NonceGuard)
  })

  const clientId = 'test-client-id'

  const signTransactionRequest = {
    request: {
      action: 'signTransaction',
      nonce: 'random-nonce-111',
      transactionRequest: {
        from: '0x2c4895215973CbBd778C32c456C074b99daF8Bf1',
        to: '0x04B12F0863b83c7162429f0Ebb0DfdA20E1aA97B',
        chainId: 137,
        value: '0x5af3107a4000',
        data: '0x',
        nonce: 317,
        type: '2',
        gas: '21004',
        maxFeePerGas: '291175227375',
        maxPriorityFeePerGas: '81000000000'
      },
      resourceId: 'eip155:eoa:0x2c4895215973CbBd778C32c456C074b99daF8Bf1'
    }
  }

  const validHeaders = {
    [REQUEST_HEADER_CLIENT_ID]: clientId
  }

  it(`throws when ${REQUEST_HEADER_CLIENT_ID} header is not present`, async () => {
    const context = mockExecutionContext({
      headers: {},
      body: signTransactionRequest
    })

    await expect(() => guard.canActivate(context)).rejects.toThrow(ApplicationException)
    await expect(() => guard.canActivate(context)).rejects.toThrow(
      `Missing or invalid ${REQUEST_HEADER_CLIENT_ID} header`
    )
  })

  it(`throws when nonce request property is not present`, async () => {
    const req = mockExecutionContext({
      headers: validHeaders,
      body: {}
    })

    await expect(() => guard.canActivate(req)).rejects.toThrow(ApplicationException)
    await expect(() => guard.canActivate(req)).rejects.toThrow('Missing request nonce')
  })

  it('throws when nonce already exists', async () => {
    nonceServiceMock.exist.mockResolvedValue(true)

    const req = mockExecutionContext({
      headers: validHeaders,
      body: signTransactionRequest
    })

    await expect(() => guard.canActivate(req)).rejects.toThrow(ApplicationException)
    await expect(() => guard.canActivate(req)).rejects.toThrow('Nonce already used')
  })

  it('returns true when nonce is valid', async () => {
    const canActivate = await guard.canActivate(
      mockExecutionContext({ body: signTransactionRequest, headers: validHeaders })
    )

    expect(canActivate).toEqual(true)
  })
})
