import type { Config } from 'jest'

const config: Config = {
  displayName: 'armory-sdk',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
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
