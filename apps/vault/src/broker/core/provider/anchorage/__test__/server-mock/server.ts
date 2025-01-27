import { HttpStatus } from '@nestjs/common'
import { HttpResponse, http } from 'msw'
import getTransferOk from './response/get-transfer-200.json'
import trustedDestinationsSecond from './response/get-trusted-destinations-200-second.json'
import trustedDestinationsThird from './response/get-trusted-destinations-200-third.json'
import trustedDestinationsFirst from './response/get-trusted-destinations-200.json'
import getVaultsOkSecond from './response/get-vaults-200-second.json'
import getVaultsOk from './response/get-vaults-200.json'
import getVaultAddressesOk from './response/get-vaults-addresses-200.json'
import getWalletOk from './response/get-wallet-200.json'
import getWalletsOk from './response/get-wallets-200.json'
import postTransferCreated from './response/post-transfer-201.json'

export const ANCHORAGE_TEST_API_BASE_URL = 'https://test-mock-api.anchorage.com'

export const getTrustedDestinationHandlers = (baseUrl = ANCHORAGE_TEST_API_BASE_URL) => {
  return {
    findAll: http.get(`${baseUrl}/v2/trusted_destinations`, () => {
      return new HttpResponse(JSON.stringify(trustedDestinationsFirst))
    }),

    deleteAndUpdate: http.get(`${baseUrl}/v2/trusted_destinations`, () => {
      return new HttpResponse(JSON.stringify(trustedDestinationsSecond))
    }),

    connect: http.get(`${baseUrl}/v2/trusted_destinations`, () => {
      return new HttpResponse(JSON.stringify(trustedDestinationsThird))
    })
  }
}

export const getVaultHandlers = (baseUrl = ANCHORAGE_TEST_API_BASE_URL) => {
  return {
    findAll: http.get(`${baseUrl}/v2/vaults`, () => {
      return new HttpResponse(JSON.stringify(getVaultsOk))
    }),
    update: http.get(`${baseUrl}/v2/vaults`, () => {
      return new HttpResponse(JSON.stringify(getVaultsOkSecond))
    })
  }
}

export const getHandlers = (baseUrl = ANCHORAGE_TEST_API_BASE_URL) => [
  http.get(`${baseUrl}/v2/vaults/:vaultId/addresses`, () => {
    return new HttpResponse(JSON.stringify(getVaultAddressesOk))
  }),

  http.get(`${baseUrl}/v2/wallets`, () => {
    return new HttpResponse(JSON.stringify(getWalletsOk))
  }),

  http.get(`${baseUrl}/v2/wallets/6a46a1977959e0529f567e8e927e3895`, () => {
    return new HttpResponse(JSON.stringify(getWalletOk))
  }),

  http.get(`${baseUrl}/v2/wallets/notFound`, () => {
    return new HttpResponse(JSON.stringify({ errorType: 'NotFound', message: 'Wallet not found' }), {
      status: HttpStatus.NOT_FOUND
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as unknown as any)
  }),

  http.get(`${baseUrl}/v2/transfers/:transferId`, () => {
    return new HttpResponse(JSON.stringify(getTransferOk))
  }),

  http.post(`${baseUrl}/v2/transfers`, () => {
    return new HttpResponse(JSON.stringify(postTransferCreated))
  }),

  getVaultHandlers(baseUrl).findAll,

  getTrustedDestinationHandlers(baseUrl).findAll
]
