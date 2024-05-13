import { generateSecret } from '@narval/nestjs-shared'
import { Alg, privateKeyToHex, privateKeyToJwk, secp256k1PrivateKeyToPublicJwk } from '@narval/signature'
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { v4 as uuid } from 'uuid'
import { generatePrivateKey } from 'viem/accounts'
import { ClientId } from '../../../../shared/decorator/client-id.decorator'
import { AdminApiKeyGuard } from '../../../../shared/guard/admin-api-key.guard'
import { ClientSecretGuard } from '../../../../shared/guard/client-secret.guard'
import { ClientService } from '../../../core/service/client.service'
import { CreateClientDto } from '../dto/create-client.dto'

@Controller('/clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  @UseGuards(AdminApiKeyGuard)
  async create(@Body() body: CreateClientDto) {
    const now = new Date()

    const client = await this.clientService.save({
      clientId: body.clientId || uuid(),
      clientSecret: generateSecret(),
      dataStore: {
        entity: body.entityDataStore,
        policy: body.policyDataStore
      },
      signer: {
        type: 'PRIVATE_KEY',
        key: privateKeyToJwk(generatePrivateKey(), Alg.ES256K)
      },
      createdAt: now,
      updatedAt: now
    })

    const hex = await privateKeyToHex(client.signer.key)

    const publicKey = secp256k1PrivateKeyToPublicJwk(hex)

    return {
      ...client,
      signer: { publicKey }
    }
  }

  @Post('/sync')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ClientSecretGuard)
  async sync(@ClientId() clientId: string) {
    try {
      const ok = await this.clientService.syncDataStore(clientId)

      return { ok }
    } catch (error) {
      return { ok: false }
    }
  }
}
