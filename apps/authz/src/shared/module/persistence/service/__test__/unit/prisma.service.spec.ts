import { ConfigService } from '@nestjs/config'
import { mock } from 'jest-mock-extended'
import { PrismaService } from '../../prisma.service'

describe(PrismaService.name, () => {
  describe('constructor', () => {
    it('does not throw when ENGINE_DATABASE_URL is present', () => {
      const configServiceMock = mock<ConfigService>({
        get: jest.fn().mockReturnValue('file:./engine-core-test.sqlite')
      })

      expect(() => {
        new PrismaService(configServiceMock)
      }).not.toThrow()
    })
  })
})
