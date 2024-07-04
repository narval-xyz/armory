import { ConfigService } from '@narval/config-module'
import { Config } from '../../../policy-engine.config'
import { SimpleSigningService } from '../service/signing-basic.service'
import { SigningService } from '../service/signing.service.interface'

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

    try {
      const { ArmoryMpcSigningService } = await import('@narval-xyz/armory-mpc-module')

      return new ArmoryMpcSigningService(tsm)
    } catch {
      throw new Error('Unable to lazy load @narval-xyz/armory-mpc-module dependency')
    }
  }

  throw new Error(`Missing implementation for signing protocol: ${protocol}`)
}
