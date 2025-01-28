import { HttpResponse, http } from 'msw'
import getTransactionOk from './response/get-transaction-200.json'
import vaultAccount3 from './response/get-vault-account-3-200.json'
import getWalletAddressesEthOk from './response/get-wallet-addresses-ethereum-200.json'
import getWalletAddressesMaticOk from './response/get-wallet-addresses-matic-200.json'
import postTransactionCreated from './response/post-transaction-201.json'

export const FIREBLOCKS_TEST_API_BASE_URL = 'https://test-mock-api.fireblocks.com'

export const getVaultAccount3AddressesHandlers = (baseUrl = FIREBLOCKS_TEST_API_BASE_URL) => {
  return {
    getMatic: http.get(
      `${baseUrl}/v1/vault/accounts/:vaultAccountId/:assetId/addresses_paginated`,
      () => new HttpResponse(JSON.stringify(getWalletAddressesMaticOk))
    ),
    getEth: http.get(
      `${baseUrl}/v1/vault/accounts/:vaultAccountId/:assetId/addresses_paginated`,
      () => new HttpResponse(JSON.stringify(getWalletAddressesEthOk))
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

  http.get(`${baseUrl}/v1/vault/accounts/:vaultAccountId`, () => {
    return new HttpResponse(JSON.stringify(vaultAccount3))
  }),

  getVaultAccount3AddressesHandlers(baseUrl).getMatic
]
