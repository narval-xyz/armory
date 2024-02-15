import { AddressBookAccountEntity } from '@narval/authz-shared'
import { Injectable } from '@nestjs/common'
import { AddressBookRepository } from '../../persistence/repository/address-book.repository'

@Injectable()
export class AddressBookService {
  constructor(private addressBookRepository: AddressBookRepository) {}

  create(orgId: string, account: AddressBookAccountEntity): Promise<AddressBookAccountEntity> {
    return this.addressBookRepository.create(orgId, account)
  }
}
