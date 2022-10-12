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

import { readdirSync } from 'fs';
import { join } from 'path';
import { SceanarioUtils } from './utils';
import { LogCounts, SceanarioError } from './types';

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

function getErrorMatcher(error?: SceanarioError) {
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

describe('Scenarios tests', () => {
  let scenarios = (process.env.scenarios || 'all').split(/, /);
  if (scenarios[0] === 'all') {
    scenarios = readdirSync(join(__dirname, 'scenarios'));
  }
  scenarios.forEach((scenario) => {
    describe(`${scenario}`, () => {
      const scenarioDir = join(__dirname, 'scenarios', scenario);
      const sceanarios = SceanarioUtils.extractScenarios(scenarioDir);
      sceanarios.forEach((scenario, index) => {
        it(`Scenario ${index}`, async () => {
          try {
            const workflowEngine = await SceanarioUtils.createWorkflowEngine(scenarioDir, scenario);
            const result = await SceanarioUtils.executeScenario(workflowEngine, scenario);
            expect(result.output).toEqual(scenario.output);
          } catch (error: any) {
            expect(error).toMatchObject(getErrorMatcher(scenario.error));
            if (scenario.errorClass) {
              expect(error.error?.constructor.name).toEqual(scenario.errorClass);
            }
          }
          if (scenario.logger) {
            testLogger(scenario.logger);
          }
        });
      });
    });
  });
});
