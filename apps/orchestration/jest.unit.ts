/* eslint-disable no-relative-import-paths/no-relative-import-paths */

import type { Config } from 'jest'
import sharedConfig from './jest.config'

const config: Config = {
  ...sharedConfig,
  testMatch: ['<rootDir>/**/__test__/unit/**/*.spec.ts']
}

export default config
