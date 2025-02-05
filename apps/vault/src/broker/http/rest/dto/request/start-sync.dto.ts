import { createZodDto } from 'nestjs-zod'
import { StartSync } from '../../../../core/type/sync.type'

export class StartSyncDto extends createZodDto(StartSync.omit({ clientId: true })) {}
