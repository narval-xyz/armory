import { z } from 'zod'
import { appSchema } from '../schema/app.schema'
import { clientSchema } from '../schema/client.schema'
import { walletSchema } from '../schema/wallet.schema'

export type Client = z.infer<typeof clientSchema>

export type App = z.infer<typeof appSchema>

export type Wallet = z.infer<typeof walletSchema>
