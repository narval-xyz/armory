import { LoggerModule } from '@narval/nestjs-shared'
import { HttpModule } from '@nestjs/axios'
import { HttpStatus } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { lowerCase } from 'lodash/fp'
import nock from 'nock'
import { generateSimplePrice } from '../../__test__/fixture/coin-gecko.fixture'
import { CoinGeckoClient } from '../../coin-gecko.client'
import { CoinGeckoException } from '../../coin-gecko.exception'

describe(CoinGeckoClient.name, () => {
  let module: TestingModule
  let client: CoinGeckoClient

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [HttpModule, LoggerModule.forTest()],
      providers: [CoinGeckoClient]
    }).compile()

    client = module.get<CoinGeckoClient>(CoinGeckoClient)
  })

  describe('getSimplePrice', () => {
    it('returns unchangeable simple price', async () => {
      const ids = ['ETHEREUM', 'uniswap']
      const currencies = ['USD', 'eur']
      const options = {
        include_market_cap: true,
        include_24h_volume: true,
        include_24h_change: true,
        include_last_updated_at: true,
        precision: 18
      }
      const response = generateSimplePrice()

      nock(CoinGeckoClient.V3_URL)
        .get('/simple/price')
        .query({
          ids: ids.map(lowerCase).join(','),
          vs_currencies: currencies.map(lowerCase).join(','),
          ...options
        })
        .reply(HttpStatus.OK, response)

      const simplePrice = await client.getSimplePrice({
        url: CoinGeckoClient.V3_URL,
        data: {
          ids,
          vs_currencies: currencies,
          ...options
        }
      })

      expect(simplePrice.ethereum).toEqual(response.ethereum)
    })

    it('throws CoinGeckoException on errors', async () => {
      nock(CoinGeckoClient.V3_URL)
        .get('/simple/price')
        .query({
          ids: 'ethereum',
          vs_currencies: 'usd'
        })
        .reply(HttpStatus.INTERNAL_SERVER_ERROR, {
          boom: 'something went wrong'
        })

      await expect(() => {
        return client.getSimplePrice({
          url: CoinGeckoClient.V3_URL,
          data: {
            ids: ['ethereum'],
            vs_currencies: ['usd']
          }
        })
      }).rejects.toThrow(CoinGeckoException)
    })

    it('omits api key from exception data', async () => {
      const apiKey = 'test-api-key'
      const nockOption = {
        reqheaders: {
          [CoinGeckoClient.AUTH_HEADER]: apiKey
        }
      }

      nock(CoinGeckoClient.V3_URL, nockOption)
        .get('/simple/price')
        .query({
          ids: 'ethereum',
          vs_currencies: 'usd'
        })
        .reply(HttpStatus.INTERNAL_SERVER_ERROR, {
          boom: 'something went wrong'
        })

      expect.assertions(1)

      try {
        await client.getSimplePrice({
          url: CoinGeckoClient.V3_URL,
          apiKey,
          data: {
            ids: ['ethereum'],
            vs_currencies: ['usd']
          }
        })
      } catch (error) {
        expect(error.context.request.headers[CoinGeckoClient.AUTH_HEADER]).toEqual(undefined)
      }
    })
  })
})
