import { AuthorizationRequest } from '@app/orchestration/policy-engine/core/type/domain.type'
import { Feed, Signature } from '@narval/authz-shared'

export interface DataFeed<Data> {
  getId(): string
  getPubKey(): string
  getFeed(input: AuthorizationRequest): Promise<Feed<Data>>
  sign(data: Data): Promise<Signature>
}
