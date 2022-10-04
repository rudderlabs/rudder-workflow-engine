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
import { LogCounts, SceanarioError, SceanarioType } from './types';
import { WorkflowEngine } from '../src';

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

function getErrorMatcher(error: SceanarioError = {}) {
  let errorMatcher = error as any;
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
      const allScenarios = SceanarioUtils.extractScenarios(scenarioDir);
      allScenarios.forEach((scenario) => {
        it(`${scenario.type} Scenario ${scenario.index}`, async () => {
          try {
            let workflowEngine: WorkflowEngine;
            if (scenario.type === SceanarioType.Async) {
              workflowEngine = await SceanarioUtils.createWorkflowEngineAsync(
                scenarioDir,
                scenario,
              );
            } else {
              workflowEngine = SceanarioUtils.createWorkflowEngine(scenarioDir, scenario);
            }
            const result = await SceanarioUtils.executeWorkflow(workflowEngine, scenario.input);
            expect(result.output).toEqual(scenario.output);
          } catch (error: any) {
            expect(scenario.error).toBeDefined();
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
