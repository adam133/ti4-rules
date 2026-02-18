module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'script.js',
    '!node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 15,
      lines: 25,
      statements: 25
    }
  }
};
