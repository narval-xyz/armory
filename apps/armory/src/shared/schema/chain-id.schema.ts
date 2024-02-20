import { z } from 'zod'

export const chainIdSchema = z.coerce.number().min(1)
