import { getInitialLogLevel } from './logger';
import { LogLevel } from './types';

describe('Logger', () => {
  describe('getInitialLogLevel', () => {
    it('should set log level', () => {
      const oldLogLevel = process.env.LOG_LEVEL;
      process.env.LOG_LEVEL = LogLevel.DEBUG.toString();
      expect(getInitialLogLevel()).toEqual(LogLevel.DEBUG);
      process.env.LOG_LEVEL = oldLogLevel;
    });
  });
});
