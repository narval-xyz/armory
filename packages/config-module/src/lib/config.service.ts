import { Injectable } from '@nestjs/common'
// eslint-disable-next-line no-restricted-imports
import { ConfigService as NestConfigService, Path, PathValue } from '@nestjs/config'

/**
 * This service extends the NestConfigService to enforce `WasValidated` to be
 * true (2nd generic argument). Thus, ensuring `get` method return type will
 * always return a value instead of `T | undefined`
 *
 * See
 * - https://docs.nestjs.com/techniques/configuration#using-the-configservice
 * - https://docs.nestjs.com/techniques/configuration#custom-configuration-files
 * - https://github.com/nestjs/config/blob/8f519ac78f9139e0dd4ee26eb97f73344c0237e8/lib/config.service.ts#L34-L35
 */
@Injectable()
export class ConfigService<Config> extends NestConfigService<Config, true> {
  /**
   * Override the `get` method to use the configuration schema type to
   * autocomplete the property path and always return the right type for it.
   *
   * This strict typing validation makes impossible to:
   * 1. Access a property that does not exist in the configuration schema.
   * 2. Cast a property to a different type than the one defined in the
   *    configuration schema.
   */
  override get<P extends Path<Config>>(propertyPath: P): PathValue<Config, P> {
    return super.get(propertyPath, { infer: true })
  }
}
