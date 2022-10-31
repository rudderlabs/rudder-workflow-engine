jest.mock('pino');
const Pino = require('pino');
import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import { SceanarioUtils } from './utils';
import { CommonUtils } from './utils/common';

const rootDirName = 'scenarios';
const command = new Command();
command.allowUnknownOption().option('--scenarios <string>', 'Enter Scenario Names', 'all').parse();

const opts = command.opts();
let scenarios = opts.scenarios.split(/[, ]/);

if (scenarios[0] === 'all') {
  scenarios = readdirSync(join(__dirname, rootDirName));
}
const fakeLogger = CommonUtils.getFakeLogger();
Pino.mockImplementation(() => fakeLogger);

describe('Scenarios tests', () => {
  scenarios.forEach((scenario) => {
    describe(`${scenario}`, () => {
      const scenarioDir = join(__dirname, rootDirName, scenario);
      const sceanarios = SceanarioUtils.extractScenarios(scenarioDir);
      sceanarios.forEach((scenario, index) => {
        it(`Scenario ${index}`, async () => {
          try {
            const workflowEngine = await SceanarioUtils.createWorkflowEngine(scenarioDir, scenario);
            const result = await SceanarioUtils.executeScenario(workflowEngine, scenario);
            expect(result.output).toEqual(scenario.output);
          } catch (error: any) {
            expect(error).toMatchObject(CommonUtils.getErrorMatcher(scenario.error));
            if (scenario.errorClass) {
              expect(error.error?.constructor.name).toEqual(scenario.errorClass);
            }
          }
          if (scenario.logger) {
            CommonUtils.testLogger(fakeLogger, scenario.logger);
          }
        });
      });
    });
  });
});
