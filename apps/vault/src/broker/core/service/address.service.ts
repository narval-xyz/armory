import { PaginatedResult, PaginationOptions } from '@narval/nestjs-shared'
import { Injectable } from '@nestjs/common'
import { AddressRepository } from '../../persistence/repository/address.repository'
import { Address } from '../type/indexed-resources.type'

@Injectable()
export class AddressService {
  constructor(private readonly AddressRepository: AddressRepository) {}

  async getAddresses(clientId: string, options?: PaginationOptions): Promise<PaginatedResult<Address>> {
    return this.AddressRepository.findByClientId(clientId, options)
  }

  async getAddress(clientId: string, AddressId: string): Promise<Address> {
    return this.AddressRepository.findById(clientId, AddressId)
  }
}
