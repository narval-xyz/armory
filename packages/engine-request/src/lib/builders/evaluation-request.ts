import { Feed, JwtString, Prices } from '@narval/policy-engine-shared'

export default class EvaluationRequestBuilder {
  private approvals?: JwtString[]
  private prices?: Prices
  private feeds?: Feed<unknown>[]

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
