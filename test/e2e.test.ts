jest.mock('pino');
const Pino = require('pino');
const fakeLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  level: 'info',
  child: () => fakeLogger,
};
Pino.mockImplementation(() => fakeLogger);

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { executeScenario } from './utils';
import { LogCounts, Sceanario } from './types';

function testLogger(logger: LogCounts) {
  const debugCount = logger.debug || 0;
  const infoCount = logger.info || 0;
  const warnCount = logger.warn || 0;
  const errorCount = logger.error || 0;
  if (debugCount > 0) {
    expect(fakeLogger.level).toEqual('debug');
  }
  expect(fakeLogger.debug.mock.calls.length).toBeGreaterThanOrEqual(debugCount);
  expect(fakeLogger.info.mock.calls.length).toBeGreaterThanOrEqual(infoCount);
  expect(fakeLogger.warn.mock.calls.length).toBeGreaterThanOrEqual(warnCount);
  expect(fakeLogger.error.mock.calls.length).toBeGreaterThanOrEqual(errorCount);
}

describe('Scenarios tests', () => {
  let scenarios = (process.env.scenarios || "all").split(/, /)
  if (scenarios[0] === "all") {
    scenarios = readdirSync(join(__dirname, 'scenarios'));
  }
  scenarios.forEach((scenario) => {
    describe(`${scenario}`, () => {
      const scenarioDir = join(__dirname, 'scenarios', scenario);
      const testsJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
      const tests: Sceanario[] = JSON.parse(testsJSON);
      tests.forEach((test, index) => {
        it(`Test ${index}`, async () => {
          try {
            const result = await executeScenario(scenarioDir, test);
            expect(result.output).toEqual(test.output);
          } catch (error: any) {
            expect(error).toEqual(expect.objectContaining(test.error));
            if(test.errorClass){
              expect(error.error?.constructor.name).toEqual(test.errorClass);
            }
          }
          if (test.logger) {
            testLogger(test.logger);
          }
        });
      });
    });
  });
});
