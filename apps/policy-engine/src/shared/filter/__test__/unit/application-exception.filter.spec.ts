import { ConfigService } from '@narval/config-module'
import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Response } from 'express'
import { mock } from 'jest-mock-extended'
import { Config, Env } from '../../../../policy-engine.config'
import { ApplicationException } from '../../../exception/application.exception'
import { ApplicationExceptionFilter } from '../../application-exception.filter'

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
      mock<Response>({
        json: jsonMock
      })
    )

    const host = mock<ArgumentsHost>({
      switchToHttp: jest.fn().mockReturnValue(
        mock<HttpArgumentsHost>({
          getResponse: jest.fn().mockReturnValue(
            mock<Response>({
              status: statusMock
            })
          )
        })
      )
    })

    return [host, statusMock, jsonMock]
  }

  const buildConfigServiceMock = (env: Env) =>
    mock<ConfigService<Config>>({
      get: jest.fn().mockReturnValue(env)
    })

  describe('catch', () => {
    Logger.overrideLogger([])

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
          stack: exception.stack
        })
      })
    })
  })
})
