import { AuthorizationRequest, Feed } from '@narval/policy-engine-shared'

export interface DataFeed<Data> {
  getId(): string
  getPubKey(): string
  getFeed(input: AuthorizationRequest): Promise<Feed<Data>>
  sign(data: Data): Promise<string>
}
