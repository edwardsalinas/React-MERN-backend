module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/'],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/public/**',
    '!jest.config.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 30000,
  verbose: true,
  // Ensure tests exit after completion
  forceExit: true,
  // Prevent Jest from running in watch mode
  watchman: false,
  // Clear mocks between tests
  clearMocks: true,
  // Setup files if needed
  setupFilesAfterEnv: [],
  // Set NODE_ENV for tests
  setupFiles: ['<rootDir>/jest.setup.js']
};
