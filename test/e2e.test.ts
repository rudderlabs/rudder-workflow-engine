jest.mock('pino');
const Pino = require('pino');
const fakeLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: () => fakeLogger
};
Pino.mockImplementation(() => fakeLogger);

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { WorkflowUtils, WorkflowEngine, Workflow } from '../src';
import { Sceanario } from './types';

describe('Scenarios tests', () => {
  const scenarios = readdirSync(join(__dirname, 'scenarios'));
  scenarios.forEach((scenario) => {
    describe(`${scenario} tests`, () => {
      const scenarioDir = join(__dirname, 'scenarios', scenario);
      const testsJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
      const tests: Sceanario[] = JSON.parse(testsJSON);
      const defaultWorkflowPath = join(scenarioDir, 'workflow.yaml');
      let defaultWorkflowEngine: WorkflowEngine;
      if (existsSync(defaultWorkflowPath)) {
        defaultWorkflowEngine = new WorkflowEngine(
          WorkflowUtils.createFromFilePath<Workflow>(defaultWorkflowPath),
          scenarioDir,
        );
      }
      tests.forEach((test, index) => {
        it(`Test ${index}`, async () => {
          try {
            let workflowEngine = defaultWorkflowEngine;
            if (test.workflowPath) {
              const workflowPath = join(scenarioDir, test.workflowPath);
              workflowEngine = new WorkflowEngine(
                WorkflowUtils.createFromFilePath<Workflow>(workflowPath),
                scenarioDir,
              );
            }
            let result = await workflowEngine.execute(test.input);
            // JSONata creates immutable arrays and it cause issues
            // so doing the following makes the comparison successful.
            result = JSON.parse(JSON.stringify(result));
            expect(result.output).toEqual(test.output);
          } catch (error: any) {
            expect(error.message).toContain(test.error);
            if (test.status) {
              expect(error.status).toEqual(test.status);
            }
          }
          if (test.logger) {
            expect(fakeLogger.debug.mock.calls.length).toBeGreaterThanOrEqual(
              test.logger.debug || 0,
            );
            expect(fakeLogger.info.mock.calls.length).toBeGreaterThanOrEqual(test.logger.info || 0);
            expect(fakeLogger.warn.mock.calls.length).toBeGreaterThanOrEqual(test.logger.warn || 0);
            expect(fakeLogger.error.mock.calls.length).toBeGreaterThanOrEqual(
              test.logger.error || 0,
            );
          }
        });
      });
    });
  });
});
