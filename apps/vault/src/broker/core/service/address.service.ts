import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AddressRepository, FindAllOptions } from '../../persistence/repository/address.repository'
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
}
