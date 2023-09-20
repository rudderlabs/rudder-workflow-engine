import { chainExecutor } from '../../../src';
import { Scenario } from '../../types';

export const data = [
  {
    workflowPath: './bad_executor.yaml',
    error: {
      message: 'I am bad executor',
      workflowName: 'bad_executor',
    },
  },
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
    workflowPath: './non_existing_executor.yaml',
    error: {
      message: 'Workflow executor not found',
    },
  },
] as Scenario[];
