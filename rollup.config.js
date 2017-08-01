import pkg from './package.json'

export default {
  entry: 'lib/index.js',
  dest: 'dist/index.js',
  format: 'umd',
  exports: 'named',
  moduleName: pkg.name
}
