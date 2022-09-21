import { readdirSync, readFileSync, existsSync } from 'fs';
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
      const defaultWorkflowPath = join(scenarioDir, "workflow.yaml");
      let defaultWorkflowEngine: WorkflowEngine;
      if (existsSync(defaultWorkflowPath)) {
        defaultWorkflowEngine = new WorkflowEngine(WorkflowUtils.createFromFilePath(defaultWorkflowPath), scenarioDir);
      }
      tests.forEach((test, index) => {
        it(`Test ${index}`, async () => {
          try {
            let workflowEngine = defaultWorkflowEngine;
            if (test.workflowPath) {
              const workflowPath = join(scenarioDir, test.workflowPath);
              workflowEngine = new WorkflowEngine(WorkflowUtils.createFromFilePath(workflowPath), scenarioDir);
            }
            const result = await workflowEngine.execute(test.input)
            expect(result.output).toEqual(test.output);
          } catch (error: any) {
            expect(error.message).toContain(test.error);
          }
        });
      })
    });
  })
});
