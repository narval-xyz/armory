import { generateAddress, generateSupportedChainId } from '@app/orchestration/__test__/fixture/shared.fixture'
import { CHAINS, FIAT_ID_USD } from '@app/orchestration/orchestration.constant'
import { assetIdSchema } from '@app/orchestration/shared/schema/caip.schema'
import { AssetType, Namespace, Prices } from '@narval/authz-shared'
import { sample } from 'lodash'
import { times } from 'lodash/fp'
import { z } from 'zod'
import { Fixture, Generator } from 'zod-fixture'

export const fiatIdSchema = z.custom<`fiat:${string}`>((value) => {
  const parse = z.string().safeParse(value)

  return parse.success
})

export const priceSchema = z.record(fiatIdSchema, z.number().min(0))

export const pricesSchema = z.record(assetIdSchema, priceSchema)

const fiatIdGenerator = Generator({
  schema: fiatIdSchema,
  output: () => FIAT_ID_USD
})

const assetIdGenerator = Generator({
  schema: assetIdSchema,
  output: () =>
    sample([
      ...Array.from(CHAINS.values()).map(({ coin }) => coin.id),
      ...times(() => `${Namespace.EIP155}:${generateSupportedChainId()}/${AssetType.ERC20}:${generateAddress()}`, 10)
    ])
})

export const generatePrices = (partial?: Partial<Prices>): Prices => {
  const fixture = new Fixture().extend([fiatIdGenerator, assetIdGenerator]).fromSchema(pricesSchema)

  // IMPORTANT: Be careful with the Prices casting. The Zod schemas used for
  // generating prices are more precise than the types, especially concerning
  // fiat, than the type itself.
  //
  // The shared Prices type is export type `Record<AssetId, Record<string,
  // number>>`, but the schema uses a FiatId on the second record key to
  // generate better fake data.
  return {
    ...fixture,
    ...partial
  } as Prices
}

export const generatePrice = () => new Fixture().extend([fiatIdGenerator]).fromSchema(priceSchema)
