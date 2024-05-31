import { ProvisionException } from './provision.exception'

export class AlreadyActivatedException extends ProvisionException {
  constructor() {
    super('App already activated')
  }
}
