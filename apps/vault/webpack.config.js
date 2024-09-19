const { composePlugins, withNx } = require('@nx/webpack')
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin')
const { join } = require('path')

module.exports = composePlugins(withNx(), (config) => {
  // Merge the new configuration with the Nx-provided one
  return {
    ...config,
    output: {
      ...config.output,
      path: join(__dirname, '../../dist/apps/vault')
    },
    devServer: {
      ...config.devServer,
      port: 4200
    },
    plugins: [
      ...config.plugins,
      new NxAppWebpackPlugin({
        tsConfig: './tsconfig.app.json',
        compiler: 'swc',
        main: './src/main.ts',
        generatePackageJson: true
      })
    ]
  }
})
