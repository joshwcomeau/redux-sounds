// eslint-disable-next-line import/no-extraneous-dependencies
import { defaults } from 'jest-config';

const config = {
  transformIgnorePatterns: [
    '/node_modules/',
    String.raw`\.pnp\.[^\/]+$`,
    String.raw`/\.cjs$/`
  ],
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest'
  },
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '/example/'],
  setupFilesAfterEnv: ['<rootDir>/test/howlerFixSetup.cjs'],
  maxWorkers: process.env.GITHUB_ACTIONS !== 'true' ? '50%' : defaults.maxWorkers,
  reporters:
    process.env.GITHUB_ACTIONS === 'true'
      ? [['github-actions', { silent: false }], 'summary']
      : undefined
};

export default config;
