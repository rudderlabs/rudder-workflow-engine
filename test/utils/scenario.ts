import { join } from 'path';
import { WorkflowEngine, WorkflowUtils, WorkflowOutput } from '../../src';
import { Sceanario } from '../types';

export async function executeScenario(
  scenarioDir,
  test: Sceanario,
  index: number,
): Promise<WorkflowOutput> {
  console.log(`Executing: ${scenarioDir} test#${index}`);
  const workflowPath = join(scenarioDir, test.workflowPath || 'workflow.yaml');
  const workflowEngine = new WorkflowEngine(
    WorkflowUtils.createWorkflowFromFilePath(workflowPath),
    scenarioDir,
    ...(test.bindingsPaths || []),
  );
  let result = await workflowEngine.execute(test.input);
  // JSONata creates immutable arrays and it cause issues
  // so doing the following makes the comparison successful.
  result = JSON.parse(JSON.stringify(result));
  return { output: result.output };
}
