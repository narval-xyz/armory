import { HttpResponse, http } from 'msw'
import vaultAddressesOk from './response/vaults-addresses-ok.json'
import vaultsOk from './response/vaults-ok.json'
import walletsOk from './response/wallets-ok.json'

export const getHandlers = (baseUrl: string) => [
  http.get(`${baseUrl}/v2/vaults/:vaultId/addresses`, () => {
    return new HttpResponse(JSON.stringify(vaultAddressesOk))
  }),

  http.get(`${baseUrl}/v2/vaults`, () => {
    return new HttpResponse(JSON.stringify(vaultsOk))
  }),

  http.get(`${baseUrl}/v2/wallets`, () => {
    return new HttpResponse(JSON.stringify(walletsOk))
  })
]
