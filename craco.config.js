// Build config on top of react-scripts 5, so the site can bundle the ESM
// sources in src/ebird-ext (a Node toolkit that also runs in the browser).
const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

// Installed packages that ship only ES modules (react-markdown and its
// unified, micromark and hast dependencies). Jest runs CommonJS, so it has to
// transform these; everything else in node_modules it leaves alone.
function esmPackages () {
  const root = path.join(__dirname, 'node_modules')
  const names = fs.readdirSync(root).flatMap(name => name.startsWith('@')
    ? fs.readdirSync(path.join(root, name)).map(scoped => `${name}/${scoped}`)
    : [name])
  return names.filter(name => {
    try {
      return JSON.parse(fs.readFileSync(path.join(root, name, 'package.json'), 'utf8')).type === 'module'
    } catch (e) {
      return false
    }
  })
}
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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
    // A function, not an object: craco appends an object's arrays to
    // react-scripts' own, whose node_modules pattern would still win
    configure: (jestConfig) => ({
      ...jestConfig,
      // ebird-ext's tests use node:test and run in its own repo (npm test there)
      testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/ebird-ext/'],
      transformIgnorePatterns: [
        // Script files only, as react-scripts' own pattern: CSS in node_modules
        // (react-datepicker's) still needs its stub transform
        `node_modules/(?!(${esmPackages().map(escape).join('|')})/).+\\.(js|jsx|mjs|cjs|ts|tsx)$`,
        '^.+\\.module\\.(css|sass|scss)$'
      ]
    })
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
