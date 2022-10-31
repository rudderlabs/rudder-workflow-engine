import { FakeLogger, LogCounts, SceanarioError } from '../types';

export class CommonUtils {
  static getFakeLogger(): FakeLogger {
    const fakeLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      level: 'info',
      child: () => fakeLogger,
    };
    return fakeLogger;
  }

  static testLogger(fakeLogger: FakeLogger, logCounts: LogCounts) {
    const debugCount = logCounts.debug || 0;
    const infoCount = logCounts.info || 0;
    const warnCount = logCounts.warn || 0;
    const errorCount = logCounts.error || 0;
    if (debugCount > 0) {
      expect(fakeLogger.level).toEqual('debug');
    }
    expect(fakeLogger.debug.mock.calls.length).toBeGreaterThanOrEqual(debugCount);
    expect(fakeLogger.info.mock.calls.length).toBeGreaterThanOrEqual(infoCount);
    expect(fakeLogger.warn.mock.calls.length).toBeGreaterThanOrEqual(warnCount);
    expect(fakeLogger.error.mock.calls.length).toBeGreaterThanOrEqual(errorCount);
  }

  static getErrorMatcher(error?: SceanarioError) {
    if (!error) {
      // Ideally shouldn't reach here.
      // Sending default error so that test case fails.
      return { message: 'should fail' };
    }
    let errorMatcher = error;
    if (error.message) {
      errorMatcher.message = expect.stringContaining(error.message);
    }
    return errorMatcher;
  }
}
