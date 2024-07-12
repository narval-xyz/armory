import { HttpStatus } from '@nestjs/common'
import { ApplicationException } from '../../../shared/exception/application.exception'

export type FinalizeEcdsaJwtSignature = (jwts: string[]) => Promise<string>

let finalizeEcdsaJwtSignature: FinalizeEcdsaJwtSignature | undefined

export const loadFinalizeEcdsaJwtSignature = (): FinalizeEcdsaJwtSignature | void => {
  if (finalizeEcdsaJwtSignature) {
    return finalizeEcdsaJwtSignature
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require('@narval-xyz/armory-mpc-module')

    if (module.finalizeEcdsaJwtSignature) {
      finalizeEcdsaJwtSignature = module.finalizeEcdsaJwtSignature
      return module.finalizeEcdsaJwtSignature
    }

    throw new ApplicationException({
      message: 'Function finalizeEcdsaJwtSignature not found in @narval-xyz/armory-mpc-module',
      suggestedHttpStatusCode: HttpStatus.INTERNAL_SERVER_ERROR
    })
  } catch {
    // eslint-disable-next-line no-console
    console.warn('[Armory] Unable to lazy load finalizeEcdsaJwtSignature from @narval-xyz/armory-mpc-module')
  }
}
