/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import TerserWebpackPlugin from 'terser-webpack-plugin';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const base = {
  entry: './src/index.js',
  mode: 'production',
  externals: [{
    howler: 'howler/dist/howler.core.min.js'
  }],
  resolve: {
    extensions: ['.js', '.cjs', '.mjs', '.json', '.jsx', '.wasm']
  }
};

const config = [
  {
    ...base,
    externalsType: 'commonjs',
    output: {
      chunkFormat: 'commonjs',
      module: false,
      path: path.resolve(dirname, 'dist/umd'),
      filename: 'redux-sounds.js',
      library: {
        name: 'ReduxSounds',
        type: 'umd'
      },
      clean: true
    },
    target: 'browserslist:>0.3%, defaults',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'swc-loader',
            options: {
              env: {
                targets: '>0.3%, defaults',
                loose: true,
                modules: false,
                bugfixes: true,
                shippedProposals: true,
                coreJs: '3.37',
                exclude: ['transform-typeof-symbol']
              }
            }
          },
          exclude: /node_modules/,
          include: /src/,
          resolve: {
            fullySpecified: false
          }
        }
      ]
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserWebpackPlugin({
          minify: TerserWebpackPlugin.swcMinify,
          terserOptions: {
            module: false,
            compress: {
              directives: false,
              passes: 3,
              ecma: 5,
              comparisons: false,
              inline: 2
            },
            format: {
              comments: false
            },
            sourceMap: false
          }
        })
      ]
    }
  },
  {
    ...base,
    externalsType: 'module',
    output: {
      chunkFormat: 'module',
      module: true,
      path: path.resolve(dirname, 'dist/esm'),
      filename: 'redux-sounds.js',
      library: {
        type: 'module'
      },
      clean: true
    },
    experiments: {
      outputModule: true
    },
    target: 'browserslist:defaults and fully supports es6-module',
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: 'swc-loader',
            options: {
              env: {
                targets: 'defaults and fully supports es6-module',
                loose: true,
                modules: false,
                bugfixes: true,
                shippedProposals: true,
                coreJs: '3.37',
                exclude: ['transform-typeof-symbol']
              }
            }
          },
          exclude: /node_modules/,
          include: /src/,
          resolve: {
            fullySpecified: false
          }
        }
      ]
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserWebpackPlugin({
          minify: TerserWebpackPlugin.swcMinify,
          terserOptions: {
            module: true,
            compress: {
              directives: false,
              passes: 3,
              ecma: 2020,
              comparisons: false,
              inline: 2
            },
            format: {
              comments: false
            },
            sourceMap: false
          }
        })
      ]
    }
  }
];

export const parallelism = 2;

export default config;
