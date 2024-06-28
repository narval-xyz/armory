import { HttpService, HttpModule as NestHttpModule } from '@nestjs/axios'
import { DynamicModule, Global, Module } from '@nestjs/common'
import axios, { AxiosRequestConfig } from 'axios'
import axiosRetry, { DEFAULT_OPTIONS, IAxiosRetryConfig } from 'axios-retry'

interface AxiosRetryOptions {
  axiosConfig?: AxiosRequestConfig
  axiosRetryConfig?: IAxiosRetryConfig
}

/**
 * A module that provides retry functionality for Axios HTTP requests.
 * This module can be imported in a NestJS application to enable automatic retry of failed requests.
 */
@Global()
@Module({})
export class HttpModule {
  /**
   * Creates a dynamic module for the AxiosRetryModule.
   * @param options - Optional configuration options for the retry behavior.
   * @returns A dynamic module that can be imported in a NestJS application.
   */
  static forRoot(
    options: AxiosRetryOptions = {
      axiosRetryConfig: {
        ...DEFAULT_OPTIONS,
        retries: 0 // Default never retries
      }
    }
  ): DynamicModule {
    const axiosInstance = axios.create(options.axiosConfig)
    axiosRetry(axiosInstance, options.axiosRetryConfig)

    const axiosProvider = {
      provide: HttpService,
      useValue: new HttpService(axiosInstance)
    }

    return {
      module: HttpModule,
      imports: [NestHttpModule],
      providers: [axiosProvider],
      exports: [axiosProvider]
    }
  }
}
