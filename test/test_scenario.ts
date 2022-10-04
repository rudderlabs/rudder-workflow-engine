import { readFileSync } from 'fs';
import { join } from 'path';
import { Sceanario } from './types';
import { SceanarioUtils } from './utils';
const scenario = process.env.scenario || process.argv[2] || 'basic_workflow';
const index = +(process.env.index || process.argv[3] || 0);

console.log(`Executing scenario: ${scenario} and test: ${index}`);

const scenarioDir = join(__dirname, 'scenarios', scenario);
const testsJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
const tests: Sceanario[] = JSON.parse(testsJSON);
const test: Sceanario = tests[index] || tests[0];
const workflowEngine = SceanarioUtils.createWorkflowEngine(scenarioDir, test);

SceanarioUtils.executeWorkflow(workflowEngine, test)
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch(console.error);
