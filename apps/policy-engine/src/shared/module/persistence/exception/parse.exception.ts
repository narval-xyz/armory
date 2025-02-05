import { PersistenceException } from './persistence.exception'

export class ParseException extends PersistenceException {
  readonly origin: Error

  constructor(origin: Error) {
    super(origin.message)

    this.origin = origin
  }
}
