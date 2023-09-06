import { join } from 'path';
import { Command } from 'commander';
import { Scenario } from './types';
import { ScenarioUtils, CommonUtils } from './utils';

// Run: npm run test:scenario -- --scenario=batch_step --index=1
const command = new Command();
command
  .allowUnknownOption()
  .option('-s, --scenario <string>', 'Enter Scenario Name')
  .option('-i, --index <number>', 'Enter Test case index')
  .parse();

const opts = command.opts();
const scenarioName = opts.scenario || 'none';
const index = +(opts.index || 0);

describe(`${scenarioName}:`, () => {
  it(`Scenario ${index}`, async () => {
    if (scenarioName === 'none') {
      return;
    }
    const scenarioDir = join(__dirname, 'scenarios', scenarioName);
    const scenarios = ScenarioUtils.extractScenarios(scenarioDir);
    const scenario: Scenario = scenarios[index] || scenarios[0];
    try {
      console.log(
        `Executing scenario: ${scenarioName}, test: ${index}, workflow: ${
          scenario.workflowPath || 'workflow.yaml'
        }`,
      );
      const workflowEngine = await ScenarioUtils.createWorkflowEngine(scenarioDir, scenario);
      const result = await ScenarioUtils.executeScenario(workflowEngine, scenario);
      console.log('Actual result', JSON.stringify(result.output, null, 2));
      console.log('Expected result', JSON.stringify(scenario.output, null, 2));
      expect(result.output).toEqual(scenario.output);
    } catch (error: any) {
      console.error(error);
      CommonUtils.matchError(error, scenario.error);
    }
  });
});
