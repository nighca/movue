module.exports = {
  transform: {
    '.ts': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testRegex: '/test/.*$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: '__coverage__',
  mapCoverage: true
}
