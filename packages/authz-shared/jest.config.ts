import type { Config } from 'jest'

const config: Config = {
  displayName: 'authz-shared',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@narval/authz-shared/(.*)$': '<rootDir>/src/$1'
  }
}

export default config
