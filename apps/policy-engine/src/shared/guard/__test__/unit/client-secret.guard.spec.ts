import { REQUEST_HEADER_CLIENT_ID, REQUEST_HEADER_CLIENT_SECRET, secret } from '@narval/nestjs-shared'
import { HttpSource, SourceType } from '@narval/policy-engine-shared'
import { Alg, privateKeyToJwk } from '@narval/signature'
import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { generatePrivateKey } from 'viem/accounts'
import { ClientService } from '../../../../engine/core/service/client.service'
import { ApplicationException } from '../../../exception/application.exception'
import { Client } from '../../../type/domain.type'
import { ClientSecretGuard } from '../../client-secret.guard'

describe(ClientSecretGuard.name, () => {
  const CLIENT_ID = 'test-client-id'

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

  const mockService = (clientSecret = 'client-a-secret-key') => {
    const dataStoreSource: HttpSource = {
      type: SourceType.HTTP,
      url: 'http://9.9.9.9:99/test-data-store'
    }

    const client: Client = {
      clientId: CLIENT_ID,
      clientSecret: secret.hash(clientSecret),
      dataStore: {
        entity: {
          data: dataStoreSource,
          signature: dataStoreSource,
          keys: []
        },
        policy: {
          data: dataStoreSource,
          signature: dataStoreSource,
          keys: []
        }
      },
      signer: {
        privateKey: privateKeyToJwk(generatePrivateKey(), Alg.ES256K)
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
