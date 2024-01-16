import { Config, Env } from '@app/orchestration/orchestration.config'
import { ApplicationException } from '@app/orchestration/shared/exception/application.exception'
import { ApplicationExceptionFilter } from '@app/orchestration/shared/filter/application-exception.filter'
import { createMock } from '@golevelup/ts-jest'
import { ArgumentsHost, HttpStatus } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

describe(ApplicationExceptionFilter.name, () => {
  const exception = new ApplicationException({
    message: 'Test application exception filter',
    suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    context: {
      additional: 'information',
      to: 'debug'
    }
  })

  const buildArgumentsHostMock = (): [ArgumentsHost, jest.Mock, jest.Mock] => {
    const jsonMock = jest.fn()
    const statusMock = jest.fn().mockReturnValue(
      createMock<Response>({
        json: jsonMock
      })
    )

    const host = createMock<ArgumentsHost>({
      switchToHttp: () =>
        createMock<HttpArgumentsHost>({
          getResponse: () =>
            createMock<Response>({
              status: statusMock
            })
        })
    })

    return [host, statusMock, jsonMock]
  }

  const buildConfigServiceMock = (env: Env) =>
    createMock<ConfigService<Config, true>>({
      get: jest.fn().mockReturnValue(env)
    })

  describe('catch', () => {
    describe('when environment is production', () => {
      it('responds with exception status and short message', () => {
        const filter = new ApplicationExceptionFilter(buildConfigServiceMock(Env.PRODUCTION))
        const [host, statusMock, jsonMock] = buildArgumentsHostMock()

        filter.catch(exception, host)

        expect(statusMock).toHaveBeenCalledWith(exception.getStatus())
        expect(jsonMock).toHaveBeenCalledWith({
          statusCode: exception.getStatus(),
          message: exception.message,
          context: exception.context
        })
      })
    })

    describe('when environment is not production', () => {
      it('responds with exception status and complete message', () => {
        const filter = new ApplicationExceptionFilter(buildConfigServiceMock(Env.DEVELOPMENT))
        const [host, statusMock, jsonMock] = buildArgumentsHostMock()

        filter.catch(exception, host)

        expect(statusMock).toHaveBeenCalledWith(exception.getStatus())
        expect(jsonMock).toHaveBeenCalledWith({
          statusCode: exception.getStatus(),
          message: exception.message,
          context: exception.context,
          stacktrace: exception.stack
        })
      })
    })
  })
})
