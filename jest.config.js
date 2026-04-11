module.exports = {
  testMatch: ['**/tests/api/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: ['tests/api/**/*.test.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
};
