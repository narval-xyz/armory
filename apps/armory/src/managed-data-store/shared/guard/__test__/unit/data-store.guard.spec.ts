import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET, secret } from '@narval/nestjs-shared'
import { getPublicKey, privateKeyToJwk } from '@narval/signature'
import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { ClientService } from '../../../../../client/core/service/client.service'
import { Client } from '../../../../../client/core/type/client.type'
import { ApplicationException } from '../../../../../shared/exception/application.exception'
import { DataStoreGuard } from '../../data-store.guard'

describe(DataStoreGuard.name, () => {
  const clientId = 'test-client-id'
  const publicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  const mockExecutionContext = ({
    clientId,
    clientSecret,
    dataSecret
  }: {
    clientId?: string
    clientSecret?: string
    dataSecret?: string
  }) => {
    const headers = {
      [REQUEST_HEADER_CLIENT_ID]: clientId,
      ...(clientSecret && { [REQUEST_HEADER_CLIENT_SECRET]: clientSecret })
    }
    const query = {
      clientId,
      ...(dataSecret && { dataSecret })
    }
    const request = { headers, query }

    return {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext
  }

  const mockService = (clientSecret = 'client-a-secret-key', dataSecret = 'client-a-data-secret') => {
    const client: Client = {
      id: clientId,
      name: 'Client A',
      clientSecret: secret.hash(clientSecret),
      dataSecret: secret.hash(dataSecret),
      dataStore: {
        entityPublicKeys: [publicKey],
        policyPublicKeys: [publicKey]
      },
      policyEngine: {
        nodes: [
          {
            id: 'test-node-id',
            clientId: 'test-client',
            clientSecret: 'test-client-secret',
            publicKey,
            url: 'http://foo.bar'
          }
        ]
      },
      updatedAt: new Date(),
      createdAt: new Date()
    }

    const serviceMock = mock<ClientService>()
    serviceMock.findById.mockResolvedValue(client)

    return serviceMock
  }

  it(`throws an error when clientId query param and ${REQUEST_HEADER_CLIENT_ID} header are missing`, async () => {
    const guard = new DataStoreGuard(mockService())

    await expect(guard.canActivate(mockExecutionContext({}))).rejects.toThrow(ApplicationException)
  })

  it(`throws an error when ${REQUEST_HEADER_CLIENT_SECRET} header and dataSecret are missing`, async () => {
    const guard = new DataStoreGuard(mockService())

    await expect(guard.canActivate(mockExecutionContext({ clientId }))).rejects.toThrow(ApplicationException)
  })

  it(`returns true when ${REQUEST_HEADER_CLIENT_SECRET} matches the client secret key`, async () => {
    const clientSecret = 'test-client-secret'
    const guard = new DataStoreGuard(mockService(clientSecret))

    expect(await guard.canActivate(mockExecutionContext({ clientId, clientSecret }))).toEqual(true)
  })

  it(`returns true when dataSecret matches the client dataSecret`, async () => {
    const dataSecret = 'test-data-secret'
    const guard = new DataStoreGuard(mockService(undefined, dataSecret))

    expect(await guard.canActivate(mockExecutionContext({ clientId, dataSecret }))).toEqual(true)
  })

  it(`returns false when ${REQUEST_HEADER_CLIENT_SECRET} does not match the client secret key`, async () => {
    const guard = new DataStoreGuard(mockService('test-client-secret'))

    expect(await guard.canActivate(mockExecutionContext({ clientId, clientSecret: 'wrong-secret' }))).toEqual(false)
  })

  it(`returns false when dataSecret does not match the client dataSecret`, async () => {
    const guard = new DataStoreGuard(mockService(undefined, 'test-data-secret'))

    expect(await guard.canActivate(mockExecutionContext({ clientId, dataSecret: 'wrong-data-secret' }))).toEqual(false)
  })
})
