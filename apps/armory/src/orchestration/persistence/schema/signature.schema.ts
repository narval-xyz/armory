import { Alg } from '@narval/signature'
import { z } from 'zod'

export const algSchema = z.nativeEnum(Alg)
