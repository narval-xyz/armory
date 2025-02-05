import { LoggerModule } from '@narval/nestjs-shared'
import { Test } from '@nestjs/testing'
import { MockProxy, mock } from 'jest-mock-extended'
import { KeyValueRepository } from '../../../../../shared/module/key-value/core/repository/key-value.repository'
import { InMemoryKeyValueRepository } from '../../../../../shared/module/key-value/persistence/repository/in-memory-key-value.repository'
import { Client } from '../../../../../shared/type/domain.type'
import { ClientRepository } from '../../../../persistence/repository/client.repository'
import { ClientService } from '../../client.service'

describe(ClientService.name, () => {
  let clientService: ClientService
  let clientRepositoryMock: MockProxy<ClientRepository>

  const clientId = 'test-client-id'

  const client: Client = {
    clientId,
    auth: {
      disabled: true,
      local: null,
      tokenValidation: {
        disabled: true,
        url: null,
        jwksUrl: null,
        verification: {
          audience: null,
          issuer: null,
          maxTokenAge: null,
          requireBoundTokens: false,
          allowBearerTokens: false,
          allowWildcard: null
        },
        pinnedPublicKey: null
      }
    },
    name: 'test-client',
    configurationSource: 'dynamic',
    backupPublicKey: null,
    baseUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  beforeEach(async () => {
    clientRepositoryMock = mock<ClientRepository>()

    const module = await Test.createTestingModule({
      imports: [LoggerModule.forTest()],
      providers: [
        ClientService,
        {
          provide: ClientRepository,
          useValue: clientRepositoryMock
        },
        {
          provide: KeyValueRepository,
          useClass: InMemoryKeyValueRepository
        }
      ]
    }).compile()

    clientService = module.get<ClientService>(ClientService)
  })

  describe('save', () => {
    it('saves the client', async () => {
      clientRepositoryMock.save.mockResolvedValue(client)

      const actualClient = await clientService.save(client)

      expect(actualClient).toEqual(client)
      expect(clientRepositoryMock.save).toHaveBeenCalledWith(client, false)
    })
  })
})
