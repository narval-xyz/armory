import { z } from 'zod'

export const tenantIndexSchema = z.array(z.string())
