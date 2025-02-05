import { RawAesWrappingSuiteIdentifier } from '@aws-crypto/client-node'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodValidationPipe } from 'nestjs-zod'
import { ApplicationExceptionFilter } from './filter/application-exception.filter'
import { ZodExceptionFilter } from './filter/zod-exception.filter'

export const REQUEST_HEADER_AUTHORIZATION = 'Authorization'

export const ENCRYPTION_KEY_NAMESPACE = 'armory.vault'
export const ENCRYPTION_KEY_NAME = 'storage-encryption'
export const ENCRYPTION_WRAPPING_SUITE = RawAesWrappingSuiteIdentifier.AES256_GCM_IV12_TAG16_NO_PADDING

//
// Providers
//

export const HTTP_VALIDATION_PIPES = [
  {
    provide: APP_PIPE,
    // Enable transformation after validation for HTTP response serialization.
    useFactory: () => new ValidationPipe({ transform: true })
  },
  {
    provide: APP_PIPE,
    useClass: ZodValidationPipe
  }
]

export const HTTP_EXCEPTION_FILTERS = [
  {
    provide: APP_FILTER,
    useClass: ApplicationExceptionFilter
  },
  {
    provide: APP_FILTER,
    useClass: ZodExceptionFilter
  }
]

export const DEFAULT_HTTP_MODULE_PROVIDERS = [
  {
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor
  },
  ...HTTP_EXCEPTION_FILTERS,
  ...HTTP_VALIDATION_PIPES
]
