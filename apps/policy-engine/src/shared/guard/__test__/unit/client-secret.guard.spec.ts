import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { TenantService } from '../../../../engine/core/service/tenant.service'
import { REQUEST_HEADER_API_KEY, REQUEST_HEADER_CLIENT_ID } from '../../../../policy-engine.constant'
import { ApplicationException } from '../../../exception/application.exception'
import { Tenant } from '../../../type/domain.type'
import { ClientSecretGuard } from '../../client-secret.guard'

describe(ClientSecretGuard.name, () => {
  const CLIENT_ID = 'tenant-a'

  const mockExecutionContext = ({ clientSecret, clientId }: { clientSecret?: string; clientId?: string }) => {
    const headers = {
      [REQUEST_HEADER_API_KEY]: clientSecret,
      [REQUEST_HEADER_CLIENT_ID]: clientId
    }
    const request = { headers }

    return {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext
  }

  const mockService = (clientSecret: string = 'tenant-a-secret-key') => {
    const tenant: Tenant = {
      clientId: CLIENT_ID,
      clientSecret: clientSecret,
      dataStore: {
        entity: {
          dataUrl: 'http://9.9.9.9:99/test-data-store',
          signatureUrl: 'http://9.9.9.9:99/test-data-store',
          keys: []
        },
        policy: {
          dataUrl: 'http://9.9.9.9:99/test-data-store',
          signatureUrl: 'http://9.9.9.9:99/test-data-store',
          keys: []
        }
      },
      updatedAt: new Date(),
      createdAt: new Date()
    }

    const serviceMock = mock<TenantService>()
    serviceMock.findByClientId.mockResolvedValue(tenant)

    return serviceMock
  }

  it(`throws an error when ${REQUEST_HEADER_API_KEY} header is missing`, async () => {
    const guard = new ClientSecretGuard(mockService())

    await expect(guard.canActivate(mockExecutionContext({ clientId: CLIENT_ID }))).rejects.toThrow(ApplicationException)
  })

  it(`throws an error when ${REQUEST_HEADER_CLIENT_ID} header is missing`, async () => {
    const guard = new ClientSecretGuard(mockService('my-secret'))

    await expect(guard.canActivate(mockExecutionContext({ clientSecret: 'my-secret' }))).rejects.toThrow(
      ApplicationException
    )
  })

  it(`returns true when ${REQUEST_HEADER_API_KEY} matches the client secret key`, async () => {
    const adminApiKey = 'test-client-api-key'
    const guard = new ClientSecretGuard(mockService(adminApiKey))

    expect(await guard.canActivate(mockExecutionContext({ clientId: CLIENT_ID, clientSecret: adminApiKey }))).toEqual(
      true
    )
  })

  it(`returns false when ${REQUEST_HEADER_API_KEY} does not matches the client secret key`, async () => {
    const guard = new ClientSecretGuard(mockService('test-admin-api-key'))

    expect(
      await guard.canActivate(mockExecutionContext({ clientId: CLIENT_ID, clientSecret: 'wrong-secret' }))
    ).toEqual(false)
  })
})
