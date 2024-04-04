import { Category } from '../domain'
import OrganizationBuilder from './organization-request'
import WalletRequestBuilder from './wallet-request'

export function buildRequest(category: 'wallet'): WalletRequestBuilder
export function buildRequest(category: 'organization'): OrganizationBuilder
export function buildRequest(category: Category): OrganizationBuilder | WalletRequestBuilder {
  if (category === Category.WALLET) {
    return new WalletRequestBuilder()
  } else {
    return new OrganizationBuilder()
  }
}
