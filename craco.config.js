// Build config on top of react-scripts 5, so the site can bundle the ESM
// sources in src/ebird-ext (a Node toolkit that also runs in the browser).
const webpack = require('webpack')

module.exports = {
  babel: {
    // ebird-ext imports JSON with `import x from './y.json' with { type: 'json' }`
    plugins: ['@babel/plugin-syntax-import-attributes']
  },
  eslint: {
    // react-scripts' bundled ESLint can't parse import attributes. ebird-ext
    // is linted in its own repo.
    enable: false
  },
  jest: {
    configure: {
      // ebird-ext's tests use node:test and run in its own repo (npm test there)
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/ebird-ext/']
    }
  },
  webpack: {
    configure: (config) => {
      // ebird-ext only touches the filesystem when given a file path (the CLI);
      // the site always passes parsed rows, so Node built-ins can be empty.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        'fs/promises': false,
        path: false,
        url: false,
        buffer: 'buffer/'
      }
      // Webpack 5 stopped providing these Node globals; gray-matter (the
      // markdown pages) needs both
      config.plugins.push(new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser.js'
      }))
      // Webpack 5 doesn't resolve the `node:` scheme for browser builds
      config.plugins.push(new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
        resource.request = resource.request.replace(/^node:/, '')
      }))
      // Bootstrap 4's CSS uses the deprecated color-adjust; harmless, but CI
      // builds treat every warning as an error
      config.ignoreWarnings = [...(config.ignoreWarnings || []), /color-adjust/]
      return config
    }
  }
}
