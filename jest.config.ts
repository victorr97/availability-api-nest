import { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.', // Root directory of the project
  testRegex: '.*\\.spec\\.ts$', // Pattern to find test files
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest', // Use ts-jest to transform TypeScript files
  },
  collectCoverageFrom: ['**/*.(t|j)s'], // Files for which coverage is collected
  coverageDirectory: './coverage', // Output directory for coverage reports
  testEnvironment: 'node', // Test environment
  moduleNameMapper: {
    // Map absolute paths based on baseUrl and paths from tsconfig.json
    '^availability/(.*)$': '<rootDir>/src/availability/$1',
    '^utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};

export default config;
