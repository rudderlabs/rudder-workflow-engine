import { readFileSync } from 'fs';
import { join } from 'path';
import { Sceanario } from './types';
import { executeScenario } from './utils';

const scenario = process.env.scenario || 'basic_workflow';
const index = +(process.env.index || 0);

const scenarioDir = join(__dirname, 'scenarios', scenario);
const testsJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
const tests: Sceanario[] = JSON.parse(testsJSON);

executeScenario(scenarioDir, tests[index] || tests[0])
  .then(console.log)
  .catch(console.error);
