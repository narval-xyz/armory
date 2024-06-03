import { secret } from '@narval/nestjs-shared'
import { ExecutionContext } from '@nestjs/common'
import { mock } from 'jest-mock-extended'
import { AppService } from '../../../../app/core/service/app.service'
import { REQUEST_HEADER_API_KEY } from '../../../../armory.constant'
import { ApplicationException } from '../../../exception/application.exception'
import { AdminGuard } from '../../admin.guard'

describe(AdminGuard.name, () => {
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

  const mockAppService = (adminApiKey: string = 'test-admin-api-key') => {
    const app = {
      adminApiKey: secret.hash(adminApiKey),
      id: 'test-app-id',
      masterKey: 'test-master-key',
      activated: true
    }

    const serviceMock = mock<AppService>()
    serviceMock.getApp.mockResolvedValue(app)
    serviceMock.getAppOrThrow.mockResolvedValue(app)

    return serviceMock
  }

  it(`throws an error when ${REQUEST_HEADER_API_KEY} header is missing`, async () => {
    const guard = new AdminGuard(mockAppService())

    await expect(guard.canActivate(mockExecutionContext())).rejects.toThrow(ApplicationException)
  })

  it(`returns true when ${REQUEST_HEADER_API_KEY} matches the app admin api key`, async () => {
    const adminApiKey = 'test-admin-api-key'
    const guard = new AdminGuard(mockAppService(adminApiKey))

    expect(await guard.canActivate(mockExecutionContext(adminApiKey))).toEqual(true)
  })

  it(`returns false when ${REQUEST_HEADER_API_KEY} does not matches the app admin api key`, async () => {
    const guard = new AdminGuard(mockAppService('test-admin-api-key'))

    expect(await guard.canActivate(mockExecutionContext('another-api-key'))).toEqual(false)
  })
})
