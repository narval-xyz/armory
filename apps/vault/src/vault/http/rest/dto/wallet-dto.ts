import { createZodDto } from 'nestjs-zod'
import { UserFacingWallet } from '../../../../shared/type/domain.type'

export class WalletDto extends createZodDto(UserFacingWallet) {}
