import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { EngineService } from '../../../../app/core/service/engine.service'
import { REQUEST_HEADER_API_KEY } from '../../../../policy-engine.constant'
import { ApplicationException } from '../../../exception/application.exception'
import { AdminApiKeyGuard } from '../../admin-api-key.guard'

describe(AdminApiKeyGuard.name, () => {
  const mockExecutionContext = (apiKey?: string) => {
    const headers = {
      [REQUEST_HEADER_API_KEY]: apiKey
    }
    const request = { headers }

    return {
      switchToHttp: () => ({
        getRequest: () => request
      })
    } as ExecutionContext
  }

  const mockEngineService = (adminApiKey: string = 'test-admin-api-key') => {
    const engineService = mock<EngineService>()
    engineService.getEngine.mockResolvedValue({
      adminApiKey,
      id: 'test-engine-id',
      masterKey: 'test-master-key'
    })

    return engineService
  }

  it(`throws an error when ${REQUEST_HEADER_API_KEY} header is missing`, async () => {
    const guard = new AdminApiKeyGuard(mockEngineService())

    await expect(guard.canActivate(mockExecutionContext())).rejects.toThrow(ApplicationException)
  })

  it(`returns true when ${REQUEST_HEADER_API_KEY} matches the engine admin api key`, async () => {
    const adminApiKey = 'test-admin-api-key'
    const guard = new AdminApiKeyGuard(mockEngineService(adminApiKey))

    expect(await guard.canActivate(mockExecutionContext(adminApiKey))).toEqual(true)
  })

  it(`returns false when ${REQUEST_HEADER_API_KEY} does not matche the engine admin api key`, async () => {
    const guard = new AdminApiKeyGuard(mockEngineService('test-admin-api-key'))

    expect(await guard.canActivate(mockExecutionContext('another-api-key'))).toEqual(false)
  })
})
