import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { HttpStatus, Injectable } from '@nestjs/common'
import { AddressRepository, FindAllOptions } from '../../persistence/repository/address.repository'
import { BrokerException } from '../exception/broker.exception'
import { Address } from '../type/indexed-resources.type'

@Injectable()
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async getAddresses(clientId: string, options?: PaginationOptions): Promise<PaginatedResult<Address>> {
    return this.addressRepository.findByClientId(clientId, options)
  }

  async getAddress(clientId: string, AddressId: string): Promise<Address> {
    return this.addressRepository.findById(clientId, AddressId)
  }

  async bulkCreate(addresses: Address[]): Promise<Address[]> {
    return this.addressRepository.bulkCreate(addresses)
  }

  async findAll(clientId: string, opts?: FindAllOptions): Promise<PaginatedResult<Address>> {
    return this.addressRepository.findAll(clientId, opts)
  }

  async findById(clientId: string, addressId: string): Promise<Address> {
    return this.addressRepository.findById(clientId, addressId)
  }

  async findByAddressAndNetwork(clientId: string, address: string, networkId: string): Promise<Address | null> {
    const addresses = await this.addressRepository.findByAddressAndNetwork(clientId, address, networkId)

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

    return addresses.length ? addresses[0] : null
  }
}
