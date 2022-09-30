import { join } from 'path';
import { WorkflowEngine, WorkflowUtils, Workflow, WorkflowOutput } from '../../src';
import { Sceanario } from '../types';

export async function executeScenario(scenarioDir, test: Sceanario): Promise<WorkflowOutput> {
  const workflowPath = join(scenarioDir, test.workflowPath || 'workflow.yaml');
  const workflowEngine = new WorkflowEngine(
    WorkflowUtils.createFromFilePath<Workflow>(workflowPath),
    scenarioDir,
    ...(test.bindingsPaths || []),
  );
  let result = await workflowEngine.execute(test.input);
  // JSONata creates immutable arrays and it cause issues
  // so doing the following makes the comparison successful.
  result = JSON.parse(JSON.stringify(result));
  return { output: result.output };
}
