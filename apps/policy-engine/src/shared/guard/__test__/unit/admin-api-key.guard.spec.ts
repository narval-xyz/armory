import { REQUEST_HEADER_ADMIN_API_KEY, secret } from '@narval/nestjs-shared'
import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { EngineService } from '../../../../engine/core/service/engine.service'
import { ApplicationException } from '../../../exception/application.exception'
import { Engine } from '../../../type/domain.type'
import { AdminApiKeyGuard } from '../../admin-api-key.guard'

describe(AdminApiKeyGuard.name, () => {
  const mockExecutionContext = (apiKey?: string) => {
    const headers = {
      [REQUEST_HEADER_ADMIN_API_KEY]: apiKey
    }
    const request = { headers }

    return {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext
  }

  const mockEngineService = (adminApiKey = 'test-admin-api-key') => {
    const engine: Engine = {
      adminApiKeyHash: secret.hash(adminApiKey),
      id: 'test-engine-id',
      encryptionKeyringType: 'raw',
      encryptionMasterKey: 'test-master-key',
      authDisabled: false
    }

    const serviceMock = mock<EngineService>()
    serviceMock.getEngine.mockResolvedValue(engine)
    serviceMock.getEngineOrThrow.mockResolvedValue(engine)

    return serviceMock
  }

  it(`throws an error when ${REQUEST_HEADER_ADMIN_API_KEY} header is missing`, async () => {
    const guard = new AdminApiKeyGuard(mockEngineService())

    await expect(guard.canActivate(mockExecutionContext())).rejects.toThrow(ApplicationException)
  })

  it(`returns true when ${REQUEST_HEADER_ADMIN_API_KEY} matches the engine admin api key`, async () => {
    const adminApiKey = 'test-admin-api-key'
    const guard = new AdminApiKeyGuard(mockEngineService(adminApiKey))

    expect(await guard.canActivate(mockExecutionContext(adminApiKey))).toEqual(true)
  })

  it(`returns false when ${REQUEST_HEADER_ADMIN_API_KEY} does not match the engine admin api key`, async () => {
    const guard = new AdminApiKeyGuard(mockEngineService('test-admin-api-key'))

    expect(await guard.canActivate(mockExecutionContext('another-api-key'))).toEqual(false)
  })
})
