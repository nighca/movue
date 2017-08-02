module.exports = {
  transform: {
    '.(ts|tsx)': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testRegex: '/test/.*$',
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'json'
  ],
  collectCoverage: true,
  coverageDirectory: '__coverage__',
  mapCoverage: true
}
