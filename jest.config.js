module.exports = {
  testEnvironment: 'node',
  setupFiles: ['./tests/setup/env.js'],
  globalSetup: './tests/setup/globalSetup.js',
  globalTeardown: './tests/setup/globalTeardown.js',
  testTimeout: 15000,
  verbose: true,
};
