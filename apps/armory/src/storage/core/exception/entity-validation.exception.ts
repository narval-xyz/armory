import { EntityUtil } from '@narval/policy-engine-shared'
import { HttpStatus } from '@nestjs/common'
import { StorageException } from './storage.exception'

export class EntityValidationException extends StorageException {
  constructor(issues: EntityUtil.ValidationIssue[]) {
    super({
      message: 'Entity validation failed',
      suggestedHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      context: { issues }
    })
  }
}
