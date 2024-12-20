import { HttpResponse, http } from 'msw'
import trustedDestinationsFirst from './response/trusted-destinations-1.json'
import trustedDestinationsSecond from './response/trusted-destinations-2.json'
import trustedDestinationsThird from './response/trusted-destinations-3.json'
import vaultAddressesOk from './response/vaults-addresses-ok.json'
import vaultsOk from './response/vaults-ok.json'
import walletsOk from './response/wallets-ok.json'

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
    return new HttpResponse(JSON.stringify(vaultAddressesOk))
  }),

  http.get(`${baseUrl}/v2/vaults`, () => {
    return new HttpResponse(JSON.stringify(vaultsOk))
  }),

  http.get(`${baseUrl}/v2/wallets`, () => {
    return new HttpResponse(JSON.stringify(walletsOk))
  }),

  trustedDestinationsHandlers(baseUrl).findAll
]
