import { HttpStatus, Injectable } from '@nestjs/common'
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
    private readonly knownDestinationRepository: KnownDestinationRepository
  ) {}

  async resolve(
    clientId: string,
    transferParty: Source | Destination
  ): Promise<Wallet | Account | Address | KnownDestination> {
    if (isAddressDestination(transferParty)) {
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
              addresses: addresses.map(({ address, addressId }) => ({ addressId, address }))
            }
          })
        }

        return addresses[0]
      }

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
              addresses: knownDestinations.map(({ address, knownDestinationId }) => ({ knownDestinationId, address }))
            }
          })
        }

        return knownDestinations[0]
      }

      throw new BrokerException({
        message: 'Cannot resolve destination address',
        suggestedHttpStatusCode: HttpStatus.NOT_FOUND,
        context: { transferParty }
      })
    }

    if (transferParty.type === TransferPartyType.WALLET) {
      return this.walletRepository.findById(clientId, transferParty.id)
    }

    if (transferParty.type === TransferPartyType.ACCOUNT) {
      return this.accountRepository.findById(clientId, transferParty.id)
    }

    if (transferParty.type === TransferPartyType.ADDRESS) {
      return this.addressRepository.findById(clientId, transferParty.id)
    }

    throw new BrokerException({
      message: 'Cannot resolve transfer party type',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      context: { transferParty }
    })
  }
}
