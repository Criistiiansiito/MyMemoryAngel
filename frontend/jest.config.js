const path = require('path');

module.exports = {
  rootDir: '..',
  testEnvironment: '<rootDir>/backend/node_modules/jest-environment-node/build/index.js',
  setupFilesAfterEnv: ['<rootDir>/frontend/jest.setup.js'],
  testMatch: ['<rootDir>/frontend/tests/**/*.test.js'],
  transform: {
    '^.+\\.[jt]sx?$': [
      '<rootDir>/backend/node_modules/babel-jest/build/index.js',
      { configFile: path.join(__dirname, 'babel.config.js') },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@testing-library/react-native)/)',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json'],
};
