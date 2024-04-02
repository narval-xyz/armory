import { z } from 'zod'
import { appSchema } from '../schema/app.schema'
import { tenantSchema } from '../schema/tenantSchema'
import { walletSchema } from '../schema/wallet.schema'

export type Tenant = z.infer<typeof tenantSchema>

export type App = z.infer<typeof appSchema>

export type Wallet = z.infer<typeof walletSchema>
