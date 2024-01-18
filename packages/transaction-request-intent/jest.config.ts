import type { Config } from 'jest'

const config: Config = {
  coverageDirectory: '../../coverage/packages/transaction-request-intent',
  testEnvironment: 'node',
  displayName: 'transaction-request-intent',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@narval/transaction-request-intent/(.*)$': '<rootDir>/src/$1'
  },
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  }
}

export default config
