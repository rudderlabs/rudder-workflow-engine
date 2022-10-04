import { join } from 'path';
import { WorkflowOutput, WorkflowEngineFactory } from '../../src';
import { Sceanario } from '../types';

export async function executeScenario(
  scenarioDir,
  test: Sceanario,
  _index: number,
): Promise<WorkflowOutput> {
  const workflowPath = join(scenarioDir, test.workflowPath || 'workflow.yaml');
  const workflowEngine = WorkflowEngineFactory.createFromFilePath(
    workflowPath,
    scenarioDir,
    test.bindingsPaths,
  );
  let result = await workflowEngine.execute(test.input);
  // JSONata creates immutable arrays and it cause issues
  // so doing the following makes the comparison successful.
  result = JSON.parse(JSON.stringify(result));
  return { output: result.output };
}
