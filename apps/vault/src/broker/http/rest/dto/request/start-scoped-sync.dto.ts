import { createZodDto } from 'nestjs-zod'
import { StartScopedSync } from '../../../../core/type/scoped-sync.type'

export class StartScopedSyncDto extends createZodDto(StartScopedSync.omit({ clientId: true })) {}
