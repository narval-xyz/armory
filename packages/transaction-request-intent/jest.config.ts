import type { Config } from 'jest'

const config: Config = {
  displayName: 'transaction-request-intent',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/transaction-request-intent',
  moduleNameMapper: {
    '^@narval/transaction-request-intent/(.*)$': '<rootDir>/src/$1'
  }
}

export default config
