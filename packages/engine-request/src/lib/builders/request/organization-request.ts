import { OrganizationAction } from '../../domain'

export default class OrganizationBuilder {
  private action: OrganizationAction | null = null
  private nonce: string

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
