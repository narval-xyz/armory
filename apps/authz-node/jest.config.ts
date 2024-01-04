import type { Config } from 'jest'

const config: Config = {
  displayName: 'apps/authz-node',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }]
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/authz-node',
  moduleNameMapper: {
    '^@app/authz/(.*)$': '<rootDir>/src/$1'
  }
}

export default config
