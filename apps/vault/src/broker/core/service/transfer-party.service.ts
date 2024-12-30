import { LoggerService, TraceService } from '@narval/nestjs-shared'
import { HttpStatus, Inject, Injectable } from '@nestjs/common'
import { SpanStatusCode } from '@opentelemetry/api'
import { AccountRepository } from '../../persistence/repository/account.repository'
import { AddressRepository } from '../../persistence/repository/address.repository'
import { KnownDestinationRepository } from '../../persistence/repository/known-destination.repository'
import { WalletRepository } from '../../persistence/repository/wallet.repository'
import { BrokerException } from '../exception/broker.exception'
import { Account, Address, KnownDestination, Wallet } from '../type/indexed-resources.type'
import { Destination, Source, TransferPartyType, isAddressDestination } from '../type/transfer.type'

@Injectable()
export class TransferPartyService {
  constructor(
    private readonly walletRepository: WalletRepository,
    private readonly accountRepository: AccountRepository,
    private readonly addressRepository: AddressRepository,
    private readonly knownDestinationRepository: KnownDestinationRepository,
    private readonly logger: LoggerService,
    @Inject(TraceService) private readonly traceService: TraceService
  ) {}

  async resolve(
    clientId: string,
    transferParty: Source | Destination
  ): Promise<Wallet | Account | Address | KnownDestination> {
    const span = this.traceService.startSpan(`${TransferPartyService.name}.resolve`)

    try {
      return this.findTransferParty(clientId, transferParty)
    } catch (error) {
      this.logger.error('Unable to resolve transfer party', { clientId, transferParty, error })

      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR })
      span.end()

      throw error
    } finally {
      span.end()
    }
  }

  private async findTransferParty(
    clientId: string,
    transferParty: Source | Destination
  ): Promise<Wallet | Account | Address | KnownDestination> {
    this.logger.log('Find transfer party', { clientId, transferParty })

    if (isAddressDestination(transferParty)) {
      const rawAddress = transferParty.address

      this.logger.log('Starting search address destination by raw address', { clientId, rawAddress })

      const { data: addresses } = await this.addressRepository.findAll(clientId, {
        filters: {
          addresses: [transferParty.address]
        }
      })

      if (addresses.length) {
        if (addresses.length > 1) {
          throw new BrokerException({
            message: 'Cannot resolve the right address due to ambiguity',
            suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            context: {
              clientId,
              addresses: addresses.map(({ address, addressId }) => ({ addressId, address }))
            }
          })
        }

        this.logger.log('Successfully found address destination for raw address', {
          clientId,
          address: addresses[0]
        })

        return addresses[0]
      }

      this.logger.log('Starting search known destination by raw address', { clientId, rawAddress })

      const { data: knownDestinations } = await this.knownDestinationRepository.findAll(clientId, {
        filters: {
          addresses: [transferParty.address]
        }
      })

      if (knownDestinations.length) {
        if (knownDestinations.length > 1) {
          throw new BrokerException({
            message: 'Cannot resolve the known destination due to ambiguity',
            suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            context: {
              clientId,
              addresses: knownDestinations.map(({ address, knownDestinationId }) => ({ knownDestinationId, address }))
            }
          })
        }

        this.logger.log('Successfully found known destination for raw address', {
          clientId,
          knownDestination: knownDestinations[0]
        })

        return knownDestinations[0]
      }

      throw new BrokerException({
        message: 'Cannot resolve destination address',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { clientId, transferParty }
      })
    }

    if (transferParty.type === TransferPartyType.WALLET) {
      this.logger.log('Starting search for wallet by ID', { clientId, walletId: transferParty.id })
      const wallet = await this.walletRepository.findById(clientId, transferParty.id)
      this.logger.log('Successfully found wallet', { clientId, wallet })

      return wallet
    }

    if (transferParty.type === TransferPartyType.ACCOUNT) {
      this.logger.log('Starting search for account by ID', { clientId, accountId: transferParty.id })
      const account = await this.accountRepository.findById(clientId, transferParty.id)
      this.logger.log('Successfully found account', { clientId, account })

      return account
    }

    if (transferParty.type === TransferPartyType.ADDRESS) {
      this.logger.log('Starting search for address by ID', { clientId, addressId: transferParty.id })
      const address = await this.addressRepository.findById(clientId, transferParty.id)
      this.logger.log('Successfully found address', { clientId, address })

      return address
    }

    throw new BrokerException({
      message: 'Cannot resolve transfer party type',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: { transferParty }
    })
  }
}
