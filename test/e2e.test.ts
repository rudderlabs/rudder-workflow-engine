import { readdirSync } from 'fs';
import { join } from 'path';
import { Command } from 'commander';
import { ScenarioUtils } from './utils';
import { CommonUtils } from './utils/common';
import { logger } from '../src';

const rootDirName = 'scenarios';
const command = new Command();
command.allowUnknownOption().option('--scenarios <string>', 'Enter Scenario Names', 'all').parse();

const opts = command.opts();
let scenarios = opts.scenarios.split(/[, ]/);

if (scenarios[0] === 'all') {
  scenarios = readdirSync(join(__dirname, rootDirName));
}

describe('Scenarios tests', () => {
  scenarios.forEach((scenario) => {
    describe(`${scenario}`, () => {
      const scenarioDir = join(__dirname, rootDirName, scenario);
      const scenarios = ScenarioUtils.extractScenarios(scenarioDir);
      scenarios.forEach((scenario, index) => {
        it(`Scenario ${index}: ${scenario.workflowPath || 'workflow.yaml'}`, async () => {
          const previousLogLevel = logger.getLogLevel();
          if (scenario.logLevel !== undefined) {
            logger.setLogLevel(scenario.logLevel);
          }
          try {
            const workflowEngine = await ScenarioUtils.createWorkflowEngine(scenarioDir, scenario);
            const result = await ScenarioUtils.executeScenario(workflowEngine, scenario);
            expect(result.output).toEqual(scenario.output);
          } catch (error: any) {
            expect(error).toMatchObject(CommonUtils.getErrorMatcher(scenario.error));
            if (scenario.errorClass) {
              expect(error.error?.constructor.name).toEqual(scenario.errorClass);
            }
          } finally {
            if (scenario.logLevel !== undefined) {
              logger.setLogLevel(previousLogLevel);
            }
          }
        });
      });
    });
  });
});
