import { HttpResponse, http } from 'msw'
import getTransferOk from './response/get-transfer-200.json'
import trustedDestinationsSecond from './response/get-trusted-destinations-200-second.json'
import trustedDestinationsThird from './response/get-trusted-destinations-200-third.json'
import trustedDestinationsFirst from './response/get-trusted-destinations-200.json'
import getVaultsOkSecond from './response/get-vaults-200-second.json'
import getVaultsOk from './response/get-vaults-200.json'
import getVaultAddressesOk from './response/get-vaults-addresses-200.json'
import getWalletsOk from './response/get-wallets-200.json'
import postTransferCreated from './response/post-transfer-201.json'

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

export const vaultHandlers = (baseUrl: string) => {
  return {
    findAll: http.get(`${baseUrl}/v2/vaults`, () => {
      return new HttpResponse(JSON.stringify(getVaultsOk))
    }),
    update: http.get(`${baseUrl}/v2/vaults`, () => {
      return new HttpResponse(JSON.stringify(getVaultsOkSecond))
    })
  }
}

export const getHandlers = (baseUrl: string) => [
  http.get(`${baseUrl}/v2/vaults/:vaultId/addresses`, () => {
    return new HttpResponse(JSON.stringify(getVaultAddressesOk))
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

  vaultHandlers(baseUrl).findAll,

  trustedDestinationsHandlers(baseUrl).findAll
]
