import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma.service'

describe('PrismaService', () => {
  describe('constructor', () => {
    it('throws when ORCHESTRATION_DATABASE_URL is missing', () => {
      const configServiceMock = createMock<ConfigService>({
        get: jest.fn().mockReturnValue(undefined)
      })

      expect(() => {
        new PrismaService(configServiceMock)
      }).toThrow('Missing ORCHESTRATION_DATABASE_URL environment variable')
    })

    it('does not throw when ORCHESTRATION_DATABASE_URL is present', () => {
      const configServiceMock = createMock<ConfigService>({
        get: jest.fn().mockReturnValue('postgresql://test:test@localhost:5432/test?schema=public')
      })

      expect(() => {
        new PrismaService(configServiceMock)
      }).not.toThrow()
    })
  })
})
