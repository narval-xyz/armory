import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

export class EngineSignerNotFoundException extends ApplicationException {
  constructor() {
    super({
      message: 'Missing engine signer configuration',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
    })
  }
}
