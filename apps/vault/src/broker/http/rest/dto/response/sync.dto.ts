import { createZodDto } from 'nestjs-zod'
import { Sync } from '../../../../core/type/sync.type'

export class SyncDto extends createZodDto(Sync) {}
