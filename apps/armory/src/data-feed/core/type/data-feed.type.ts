import { Feed } from '@narval/policy-engine-shared'
// TODO (@wcalderipe, 06/02/24): Move the AuthorizationRequest type to shared
import { AuthorizationRequest } from '../../../orchestration/core/type/domain.type'

export interface DataFeed<Data> {
  getId(): string
  getPubKey(): string
  getFeed(input: AuthorizationRequest): Promise<Feed<Data>>
  sign(data: Data): Promise<string>
}
