import type { Config } from 'jest'

const config: Config = {
  displayName: 'vault',
  moduleFileExtensions: ['ts', 'js', 'html'],
  preset: '../../jest.preset.js',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ]
  },
  workerThreads: true // EXPERIMENTAL; lets BigInt serialization work
}

export default config
