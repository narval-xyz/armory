import { Feed, Signature } from '@narval/authz-shared'
// TODO (@wcalderipe, 06/02/24): Move the AuthorizationRequest type to shared
import { AuthorizationRequest } from '../../../policy-engine/core/type/domain.type'

export interface DataFeed<Data> {
  getId(): string
  getPubKey(): string
  getFeed(input: AuthorizationRequest): Promise<Feed<Data>>
  sign(data: Data): Promise<Signature>
}
