import { HttpResponse, http } from 'msw'
import getAssetWalletsOk from './response/get-asset-wallets-200.json'
import getTransferOk from './response/get-transfer-200.json'
import getWalletAddressesMaticOk from './response/get-wallet-addresses-matic-200.json'
import getWalletAddressesOptOk from './response/get-wallet-addresses-optimism-200.json'
import postTransferCreated from './response/post-transfer-201.json'

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
  http.get(`${baseUrl}/v2/wallets`, () => {
    return new HttpResponse(JSON.stringify(getAssetWalletsOk))
  }),

  http.get(`${baseUrl}/v2/transfers/:transferId`, () => {
    return new HttpResponse(JSON.stringify(getTransferOk))
  }),

  http.post(`${baseUrl}/v2/transfers`, () => {
    return new HttpResponse(JSON.stringify(postTransferCreated))
  }),

  getAddressesHandlers(baseUrl).getMatic
]
