// eslint-disable-next-line no-undef
// @ts-ignore
module.exports = {
  roots: ['<rootDir>/js'],
  testMatch: ['**/__tests__/**/*.+(js)', '**/?(*.)+(spec|test).+(js)'],
  verbose: true,
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  reporters: [
    'default',
    'jest-summary-reporter'
  ]
};

