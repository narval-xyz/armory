import { Category } from '../../domain'
import OrganizationBuilder from './organization-request'
import WalletRequestBuilder from './wallet-request'

/**
 * Creates a request builder for either Wallet or Organization categories.
 * @param category - The category of the request to build. Either 'wallet' or 'organization'.
 * @returns A builder instance specific to the provided category, either WalletRequestBuilder or OrganizationBuilder.
 * @example
 * // For wallet-related requests
 * const walletBuilder = buildRequest('wallet');
 *
 * // For organization-related requests
 * const organizationBuilder = buildRequest('organization');
 */
export function buildRequest(category: 'wallet'): WalletRequestBuilder
export function buildRequest(category: 'organization'): OrganizationBuilder
export function buildRequest(category: Category): OrganizationBuilder | WalletRequestBuilder {
  if (category === Category.WALLET) {
    return new WalletRequestBuilder()
  } else {
    return new OrganizationBuilder()
  }
}
