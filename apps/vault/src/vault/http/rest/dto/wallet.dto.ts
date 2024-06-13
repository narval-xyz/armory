import { createZodDto } from 'nestjs-zod'
import { _OLD_PUBLIC_WALLET_ } from '../../../../shared/type/domain.type'

export class WalletDto extends createZodDto(_OLD_PUBLIC_WALLET_) {}
