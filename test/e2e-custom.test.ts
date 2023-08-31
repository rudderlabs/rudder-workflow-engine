import { join } from 'path';
import { WorkflowEngineFactory } from '../src';

const rootDirName = 'custom_scenarios';

describe('Custom Scenarios tests', () => {
  describe('loop over input', () => {
    it('should return original error when error wrapped', async () => {
      const scenarioDir = join(__dirname, rootDirName, 'loop_over_input', 'wrapped_error');
      const workflowPath = join(scenarioDir, 'workflow.yaml');
      const workflowEngine = await WorkflowEngineFactory.createFromFilePath(workflowPath, {
        rootPath: scenarioDir,
      });
      const result = await workflowEngine.execute([
        {
          error: {
            message: 'some error',
          },
        },
      ]);
      expect(result.output[0].error?.error.message).toEqual('some error');
      expect(result.output[0].error?.originalError.message).toEqual('some error');
    });
  });
});
