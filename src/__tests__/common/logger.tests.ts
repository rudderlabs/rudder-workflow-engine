import { getLogger } from '../../common';

describe('Logger', () => {
  describe('getLogger', () => {
    const oldLogLevel = process.env.LOG_LEVEL;
    afterAll(() => {
      process.env.LOG_LEVEL = oldLogLevel;
    });
    const testCases = {
      '0': 'debug',
      '1': 'info',
      '2': 'warn',
      '3': 'error',
      debug: 'debug',
      info: 'info',
      warn: 'warn',
      error: 'error',
      custom: 'info',
    };
    Object.entries(testCases).forEach(([inputLevel, expectedLevel]) => {
      it(`Test for level ${inputLevel}`, () => {
        process.env.LOG_LEVEL = inputLevel;
        expect(getLogger('test').level).toEqual(expectedLevel);
      });
    });
  });
});
