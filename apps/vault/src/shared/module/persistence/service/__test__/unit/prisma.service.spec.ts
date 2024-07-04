import { ConfigService } from '@narval/config-module'
import { LoggerService, NullLoggerService } from '@narval/nestjs-shared'
import { mock } from 'jest-mock-extended'
import { Config } from '../../../../../../main.config'
import { PrismaService } from '../../prisma.service'

describe(PrismaService.name, () => {
  describe('constructor', () => {
    it('does not throw when APP_DATABASE_URL is present', () => {
      const configServiceMock = mock<ConfigService<Config>>({
        get: jest.fn().mockReturnValue('postgresql://test:test@localhost:5432/test?schema=public')
      })

      const loggerMock = mock<LoggerService>(new NullLoggerService())

      expect(() => {
        new PrismaService(configServiceMock, loggerMock)
      }).not.toThrow()
    })
  })
})
