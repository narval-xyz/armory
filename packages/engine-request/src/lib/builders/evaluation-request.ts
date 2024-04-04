import { Feed, JwtString, Prices } from '@narval/policy-engine-shared'

export default class EvaluationRequestBuilder {
  approvals?: JwtString[]
  prices?: Prices
  feeds?: Feed<unknown>[]

  setApprovals(approvals: JwtString[]) {
    this.approvals = approvals
    return this
  }

  setPrices(prices: Prices) {
    this.prices = prices
    return this
  }

  setFeeds(feeds: Feed<unknown>[]) {
    this.feeds = feeds
    return this
  }
}
