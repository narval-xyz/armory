import { createZodDto } from 'nestjs-zod'
import { PublicWallet } from '../../../../shared/type/domain.type'

export class WalletDto extends createZodDto(PublicWallet) {}
