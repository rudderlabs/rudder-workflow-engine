import { chainExecutor } from '../../../src';
import { Scenario } from '../../types';

export const data = [
  {
    output: 'custom executor output',
  },
  {
    input: {
      a: 1,
    },
    output: 8,
    workflowPath: './chained_executor.yaml',
    options: {
      executor: chainExecutor,
    },
  },
  {
    workflowPath: './bad_executor.yaml',
    error: {
      message: 'Workflow executor not found',
    },
  },
] as Scenario[];
