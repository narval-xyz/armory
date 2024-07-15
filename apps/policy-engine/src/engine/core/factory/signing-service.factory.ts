import { ConfigService } from '@narval/config-module'
import { HttpStatus } from '@nestjs/common'
import { Config } from '../../../policy-engine.config'
import { ApplicationException } from '../../../shared/exception/application.exception'
import { SimpleSigningService } from '../service/signing-basic.service'
import { SigningService } from '../service/signing.service.interface'

const loadArmoryMpcSigningService = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require('@narval-xyz/armory-mpc-module')

    if (module.ArmoryMpcSigningService) {
      return module.ArmoryMpcSigningService
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

export const signingServiceFactory = async (configService: ConfigService<Config>): Promise<SigningService> => {
  const protocol = configService.get('signingProtocol')

  if (protocol === 'simple') {
    return new SimpleSigningService()
  }

  if (protocol === 'mpc') {
    const tsm = configService.get('tsm')

    if (!tsm) {
      throw new Error('Missing TSM config')
    }

    const ArmoryMpcSigningService = loadArmoryMpcSigningService()

    // TODO: (@wcalderipe, 12/07/24) The ArmoryMpcSigningService has any type.
    // How to ensure type-safety in a optional module since importing the type
    // is impossible when the package isn't installed?
    return new ArmoryMpcSigningService(tsm)
  }

  throw new Error(`Missing implementation for signing protocol: ${protocol}`)
}
