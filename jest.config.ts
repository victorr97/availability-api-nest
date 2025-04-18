import { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

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
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
};

export default config;
