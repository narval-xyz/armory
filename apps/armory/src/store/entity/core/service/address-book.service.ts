import { AddressBookAccountEntity, CreateAddressBookAccountRequest } from '@narval/policy-engine-shared'
import { Injectable } from '@nestjs/common'
import { AddressBookRepository } from '../../persistence/repository/address-book.repository'

@Injectable()
export class AddressBookService {
  constructor(private addressBookRepository: AddressBookRepository) {}

  create(orgId: string, data: CreateAddressBookAccountRequest): Promise<AddressBookAccountEntity> {
    return this.addressBookRepository.create(orgId, data.request.account)
  }
}
