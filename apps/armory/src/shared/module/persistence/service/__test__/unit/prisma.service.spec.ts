import { ConfigService } from '@narval/config-module'
import { mock } from 'jest-mock-extended'
import { Config } from '../../../../../../armory.config'
import { PrismaService } from '../../../../../../shared/module/persistence/service/prisma.service'

describe(PrismaService.name, () => {
  describe('constructor', () => {
    it('does not throw when APP_DATABASE_URL is present', () => {
      const configServiceMock = mock<ConfigService<Config>>({
        get: jest.fn().mockReturnValue('postgresql://test:test@localhost:5432/test?schema=public')
      })

      expect(() => {
        new PrismaService(configServiceMock)
      }).not.toThrow()
    })
  })
})
