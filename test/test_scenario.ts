import { readFile } from 'fs/promises';
import { join } from 'path';
import { Command } from 'commander';
import { Scenario } from './types';
import { ScenarioUtils } from './utils';
import { deepEqual } from 'assert';

const command = new Command();
command
  .allowUnknownOption()
  .option('-s, --scenario <string>', 'Enter Scenario Name')
  .option('-i, --index <number>', 'Enter Test case index')
  .parse();

const opts = command.opts();
const scenarioName = opts.scenario || 'basic_workflow';
const index = +(opts.index || 0);

async function createAndExecuteWorkFlow() {
  try {
    const scenarioDir = join(__dirname, 'scenarios', scenarioName);
    const scenarios = ScenarioUtils.extractScenarios(scenarioDir);
    const scenario: Scenario = scenarios[index] || scenarios[0];
    console.log(
      `Executing scenario: ${scenarioName}, test: ${index}, workflow: ${
        scenario.workflowPath || 'workflow.yaml'
      }`,
    );
    const workflowEngine = await ScenarioUtils.createWorkflowEngine(scenarioDir, scenario);
    const result = await ScenarioUtils.executeScenario(workflowEngine, scenario);
    console.log('Actual result', JSON.stringify(result.output, null, 2));
    console.log('Expected result', JSON.stringify(scenario.output, null, 2));
    deepEqual(result.output, scenario.output, 'matching failed');
  } catch (error) {
    console.error(error);
  }
}

createAndExecuteWorkFlow();
