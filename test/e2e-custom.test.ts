jest.mock('pino');
const Pino = require('pino');
import { join } from 'path';
import { WorkflowEngineFactory } from '../src';
import { CommonUtils } from './utils/common';

const rootDirName = 'custom_scenarios';

const fakeLogger = CommonUtils.getFakeLogger();
Pino.mockImplementation(() => fakeLogger);

describe('Custom Scenarios tests', () => {
  describe('loop over input', () => {
    it('should return orginal error when error wrapped', async () => {
      const scenarioDir = join(__dirname, rootDirName, 'loop_over_input', 'wrapped_error');
      const workflowPath = join(scenarioDir, 'workflow.yaml');
      const workflowEngine = await WorkflowEngineFactory.createFromFilePath(
        workflowPath,
        scenarioDir,
      );
      const result = await workflowEngine.execute([
        {
          error: {
            message: 'some error',
          },
        },
      ]);
      expect(result.output[0].error.originalError.message).toEqual('some error');
    });
  });
});
