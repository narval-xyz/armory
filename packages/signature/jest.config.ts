import type { Config } from 'jest'

const config: Config = {
  displayName: 'signature',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transformIgnorePatterns: [
    'node_modules/(?!(viem)/)' // Transpile code in the viem package
  ],
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json'
      }
    ],
    '^.+\\.js$': 'babel-jest' // Add this line if you want to transform JS files with Babel
  }
}

export default config
