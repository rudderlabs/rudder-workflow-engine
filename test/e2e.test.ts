import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { WorkflowUtils, WorkflowEngine } from "../src"
import { Sceanario } from './types';

describe('Scenarios tests', () => {
  const scenarios = readdirSync(join(__dirname, "scenarios"));
  scenarios.forEach((scenario) => {
    describe(`${scenario} tests`, () => {
      const scenarioDir = join(__dirname, "scenarios", scenario);
      const testsJSON = readFileSync(join(scenarioDir, "data.json"), { encoding: "utf-8" });
      const tests: Sceanario[] = JSON.parse(testsJSON);
      const workflow = WorkflowUtils.createFromFilePath(join(scenarioDir, "workflow.yaml"));
      const workflowEngine = new WorkflowEngine(workflow, scenarioDir);
      tests.forEach((test, index) => {
        it(`Test ${index}`, async () => {
          try {
            const result = await workflowEngine.execute(test.input)
            expect(result.output).toEqual(test.output);
          } catch (error: any) {
            expect(error.message).toEqual(test.error);
          }
        });
      })
    });
  })
});
