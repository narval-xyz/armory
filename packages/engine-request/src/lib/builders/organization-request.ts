import { OrganizationAction } from '../domain'
import EvaluationRequestBuilder from './evaluation-request'

export default class OrganizationBuilder extends EvaluationRequestBuilder {
  action: OrganizationAction | null = null
  nonce: string

  setAction(action: OrganizationAction) {
    this.action = action
    switch (action) {
      case OrganizationAction.CREATE_ORGANIZATION:
        return new CreateOrganizationBuilder()
    }
  }

  setNonce(nonce: string) {
    this.nonce = nonce
    return this
  }
}

class CreateOrganizationBuilder extends OrganizationBuilder {
  private organizationId: string

  setOrganization(organizationId: string) {
    this.organizationId = organizationId
    return this
  }
}
