import { secret } from '@narval/nestjs-shared'
import { getPublicKey, privateKeyToJwk } from '@narval/signature'
import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET } from '../../../../armory.constant'
import { ClientService } from '../../../../client/core/service/client.service'
import { Client } from '../../../../client/core/type/client.type'
import { ApplicationException } from '../../../exception/application.exception'
import { DataStoreGuard } from '../../data-store.guard'

describe(DataStoreGuard.name, () => {
  const clientId = 'test-client-id'
  const publicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  const mockExecutionContext = ({
    clientId,
    clientSecret,
    dataApiKey
  }: {
    clientId?: string
    clientSecret?: string
    dataApiKey?: string
  }) => {
    const headers = {
      [REQUEST_HEADER_CLIENT_ID]: clientId,
      ...(clientSecret && { [REQUEST_HEADER_CLIENT_SECRET]: clientSecret })
    }
    const query = {
      clientId,
      ...(dataApiKey && { dataApiKey })
    }
    const request = { headers, query }

    return {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext
  }

  const mockService = (clientSecret = 'client-a-secret-key', dataApiKey = 'client-a-data-api-key') => {
    const client: Client = {
      id: clientId,
      name: 'Client A',
      clientSecret: secret.hash(clientSecret),
      dataApiKey: secret.hash(dataApiKey),
      dataStore: {
        entityPublicKey: publicKey,
        policyPublicKey: publicKey
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

  it(`throws an error when ${REQUEST_HEADER_CLIENT_SECRET} header and dataApiKey are missing`, async () => {
    const guard = new DataStoreGuard(mockService())

    await expect(guard.canActivate(mockExecutionContext({ clientId }))).rejects.toThrow(ApplicationException)
  })

  it(`returns true when ${REQUEST_HEADER_CLIENT_SECRET} matches the client secret key`, async () => {
    const clientSecret = 'test-client-secret'
    const guard = new DataStoreGuard(mockService(clientSecret))

    expect(await guard.canActivate(mockExecutionContext({ clientId, clientSecret }))).toEqual(true)
  })

  it(`returns true when dataApiKey matches the client dataApiKey`, async () => {
    const dataApiKey = 'test-data-api-key'
    const guard = new DataStoreGuard(mockService(undefined, dataApiKey))

    expect(await guard.canActivate(mockExecutionContext({ clientId, dataApiKey }))).toEqual(true)
  })

  it(`returns false when ${REQUEST_HEADER_CLIENT_SECRET} does not match the client secret key`, async () => {
    const guard = new DataStoreGuard(mockService('test-client-secret'))

    expect(await guard.canActivate(mockExecutionContext({ clientId, clientSecret: 'wrong-secret' }))).toEqual(false)
  })

  it(`returns false when dataApiKey does not match the client dataApiKey`, async () => {
    const guard = new DataStoreGuard(mockService(undefined, 'test-data-api-key'))

    expect(await guard.canActivate(mockExecutionContext({ clientId, dataApiKey: 'wrong-data-api-key' }))).toEqual(false)
  })
})
