/* eslint-disable strict */

module.exports = {
  presets: [
    ['@babel/preset-env', {
      // modules: false,
      targets: {
        node: 'current',
      },
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    // '@babel/plugin-transform-object-super',
    // '@babel/plugin-transform-classes',
    // '@babel/plugin-syntax-dynamic-import',
    '@babel/plugin-transform-modules-commonjs',
  ],
  env: {
    production: {
      presets: [
        'minify',
      ],
    },
    test: {
      presets: [
        '@babel/preset-env',
      ],
    },
  },
};
