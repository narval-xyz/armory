import { ConfigService } from '@nestjs/config'
import { mock } from 'jest-mock-extended'
import { PrismaService } from '../../prisma.service'

describe(PrismaService.name, () => {
  describe('constructor', () => {
    it('does not throw when POLICY_ENGINE_DATABASE_URL is present', () => {
      const configServiceMock = mock<ConfigService>({
        get: jest.fn().mockReturnValue('postgresql://test:test@localhost:5432/test?schema=public')
      })

      expect(() => {
        new PrismaService(configServiceMock)
      }).not.toThrow()
    })
  })
})
