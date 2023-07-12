module.exports = {
  clearMocks: true,
  moduleFileExtensions: [
    'json',
    'ts',
    'js'
  ],
  roots: [
    'tests',
  ],
  setupFiles: [
    'dotenv-flow/config',
  ],
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/',
  ],
  watchPathIgnorePatterns: [
  ],
  testTimeout: 100000,
  preset: 'ts-jest',
}