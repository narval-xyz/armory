import { PrismaService } from '@app/orchestration/shared/module/persistence/service/prisma.service'
import { createMock } from '@golevelup/ts-jest'
import { ConfigService } from '@nestjs/config'

describe('PrismaService', () => {
  describe('constructor', () => {
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
