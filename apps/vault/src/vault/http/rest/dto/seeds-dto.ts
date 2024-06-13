import { PublicSeed } from '@narval/armory-sdk';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class SeedsDto extends createZodDto(z.object({
  seeds: z.array(PublicSeed)
})) {}
