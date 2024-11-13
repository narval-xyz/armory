import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET, secret } from '@narval/nestjs-shared'
import { getPublicKey, privateKeyToJwk } from '@narval/signature'
import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { ClientService } from '../../../../client/core/service/client.service'
import { Client } from '../../../../client/core/type/client.type'
import { ApplicationException } from '../../../exception/application.exception'
import { ClientSecretGuard } from '../../client-secret.guard'

describe(ClientSecretGuard.name, () => {
  const CLIENT_ID = 'test-client-id'
  const publicKey = getPublicKey(privateKeyToJwk(generatePrivateKey()))

  const mockExecutionContext = ({ clientSecret, clientId }: { clientSecret?: string; clientId?: string }) => {
    const headers = {
      [REQUEST_HEADER_CLIENT_SECRET]: clientSecret,
      [REQUEST_HEADER_CLIENT_ID]: clientId
    }
    const request = { headers }

    return {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext
  }

  const mockService = (clientSecret = 'client-a-secret-key', dataSecret = 'client-a-data-secret') => {
    const client: Client = {
      id: CLIENT_ID,
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

  it(`throws an error when ${REQUEST_HEADER_CLIENT_SECRET} header is missing`, async () => {
    const guard = new ClientSecretGuard(mockService())

    await expect(guard.canActivate(mockExecutionContext({ clientId: CLIENT_ID }))).rejects.toThrow(ApplicationException)
  })

  it(`throws an error when ${REQUEST_HEADER_CLIENT_ID} header is missing`, async () => {
    const guard = new ClientSecretGuard(mockService('my-secret'))

    await expect(guard.canActivate(mockExecutionContext({ clientSecret: 'my-secret' }))).rejects.toThrow(
      ApplicationException
    )
  })

  it(`returns true when ${REQUEST_HEADER_CLIENT_SECRET} matches the client secret key`, async () => {
    const clientSecret = 'test-client-secret'
    const guard = new ClientSecretGuard(mockService(clientSecret))

    expect(await guard.canActivate(mockExecutionContext({ clientId: CLIENT_ID, clientSecret }))).toEqual(true)
  })

  it(`returns false when ${REQUEST_HEADER_CLIENT_SECRET} does not matches the client secret key`, async () => {
    const guard = new ClientSecretGuard(mockService('test-client-secret'))

    expect(
      await guard.canActivate(mockExecutionContext({ clientId: CLIENT_ID, clientSecret: 'wrong-secret' }))
    ).toEqual(false)
  })
})
