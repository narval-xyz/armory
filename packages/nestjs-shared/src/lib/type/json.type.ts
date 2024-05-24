import { z } from 'zod'

// NOTE: Implementation copied from https://github.com/colinhacks/zod/discussions/2178#discussioncomment-5256971

const Primitive = z.union([z.string(), z.number(), z.boolean(), z.null()])

type Primitive = z.infer<typeof Primitive>

export type Json = Primitive | { [key: string]: Json } | Json[]

export const Json: z.ZodType<Json> = z.lazy(() => z.union([Primitive, z.array(Json), z.record(Json)]))
