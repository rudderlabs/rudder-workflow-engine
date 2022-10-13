import { readFile } from 'fs/promises';
import { join } from 'path';
import { Command } from 'commander';
import { Sceanario } from './types';
import { SceanarioUtils } from './utils';

const command = new Command();
command
  .allowUnknownOption()
  .option('-s, --scenario <string>', 'Enter Scenario Name')
  .option('-i, --index <number>', 'Enter Test case index')
  .parse();

const opts = command.opts();
const scenario = opts.scenario || process.argv[2] || 'basic_workflow';
const index = +(opts.index || process.argv[3] || 0);

console.log(`Executing scenario: ${scenario} and test: ${index}`);

async function createAndExecuteWorkFlow() {
  try {
    const scenarioDir = join(__dirname, 'scenarios', scenario);
    const sceanariosJSON = await readFile(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
    const sceanarios: Sceanario[] = JSON.parse(sceanariosJSON);
    const sceanario: Sceanario = sceanarios[index] || sceanarios[0];
    const workflowEngine = await SceanarioUtils.createWorkflowEngine(scenarioDir, sceanario);
    const result = await SceanarioUtils.executeScenario(workflowEngine, sceanario);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error);
  }
}

createAndExecuteWorkFlow();
