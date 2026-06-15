import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@config$':              '<rootDir>/src/config',
    '^@config/(.*)$':        '<rootDir>/src/config/$1',
    '^@modules/(.*)$':       '<rootDir>/src/modules/$1',
    '^@core/(.*)$':          '<rootDir>/src/core/$1',
    '^@infrastructure/(.*)$':'<rootDir>/src/infrastructure/$1',
    '^@middleware/(.*)$':    '<rootDir>/src/middleware/$1',
    '^@shared/(.*)$':        '<rootDir>/src/shared/$1',
  },
  coverageThreshold: {
    global: { branches: 70, functions: 75, lines: 75, statements: 75 },
  },
};

export default config;
