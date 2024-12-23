import { HttpResponse, http } from 'msw'
import getTransferOk from './response/get-transfer-200.json'
import getVaultsOk from './response/get-vaults-200.json'
import getVaultAddressesOk from './response/get-vaults-addresses-200.json'
import getWalletsOk from './response/get-wallets-200.json'
import postTransferCreated from './response/post-transfer-201.json'
import trustedDestinationsFirst from './response/trusted-destinations-1.json'
import trustedDestinationsSecond from './response/trusted-destinations-2.json'
import trustedDestinationsThird from './response/trusted-destinations-3.json'

export const trustedDestinationsHandlers = (baseUrl: string) => {
  return {
    findAll: http.get(`${baseUrl}/v2/trusted-destinations`, () => {
      return new HttpResponse(JSON.stringify(trustedDestinationsFirst))
    }),

    deleteAndUpdate: http.get(`${baseUrl}/v2/trusted-destinations`, () => {
      return new HttpResponse(JSON.stringify(trustedDestinationsSecond))
    }),

    connect: http.get(`${baseUrl}/v2/trusted-destinations`, () => {
      return new HttpResponse(JSON.stringify(trustedDestinationsThird))
    })
  }
}

export const getHandlers = (baseUrl: string) => [
  http.get(`${baseUrl}/v2/vaults/:vaultId/addresses`, () => {
    return new HttpResponse(JSON.stringify(getVaultAddressesOk))
  }),

  http.get(`${baseUrl}/v2/vaults`, () => {
    return new HttpResponse(JSON.stringify(getVaultsOk))
  }),

  http.get(`${baseUrl}/v2/wallets`, () => {
    return new HttpResponse(JSON.stringify(getWalletsOk))
  }),

  http.get(`${baseUrl}/v2/transfers/:transferId`, () => {
    return new HttpResponse(JSON.stringify(getTransferOk))
  }),

  http.post(`${baseUrl}/v2/transfers`, () => {
    return new HttpResponse(JSON.stringify(postTransferCreated))
  }),

  trustedDestinationsHandlers(baseUrl).findAll
]
