import { HttpResponse, http } from 'msw'
import getTransactionOk from './response/get-transaction-200.json'
import getWalletAddressesMaticOk from './response/get-wallet-addresses-matic-200.json'
import getWalletAddressesOptOk from './response/get-wallet-addresses-optimism-200.json'
import postTransactionCreated from './response/post-transaction-201.json'

export const FIREBLOCKS_TEST_API_BASE_URL = 'https://test-mock-api.fireblocks.com'

export const getAddressesHandlers = (baseUrl = FIREBLOCKS_TEST_API_BASE_URL) => {
  return {
    getMatic: http.get(
      `${baseUrl}vault/accounts/:vaultAccountId/:assetId/addresses_paginated`,
      () => new HttpResponse(JSON.stringify(getWalletAddressesMaticOk))
    ),
    getOptimism: http.get(
      `${baseUrl}vault/accounts/:vaultAccountId/:assetId/addresses_paginated`,
      () => new HttpResponse(JSON.stringify(getWalletAddressesOptOk))
    )
  }
}

export const getHandlers = (baseUrl = FIREBLOCKS_TEST_API_BASE_URL) => [
  http.get(`${baseUrl}/v1/transactions/:txId`, () => {
    return new HttpResponse(JSON.stringify(getTransactionOk))
  }),

  http.post(`${baseUrl}/v1/transactions`, () => {
    return new HttpResponse(JSON.stringify(postTransactionCreated))
  }),

  getAddressesHandlers(baseUrl).getMatic
]
