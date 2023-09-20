import { WorkflowEngine, WorkflowExecutor, WorkflowOutput } from '../../../src';

class CustomWorkflowExecutor implements WorkflowExecutor {
  async execute(_engine: WorkflowEngine, _input: any): Promise<WorkflowOutput> {
    return {
      output: 'custom executor output',
    };
  }
}

class BadWorkflowExecutor implements WorkflowExecutor {
  async execute(_engine: WorkflowEngine, _input: any): Promise<WorkflowOutput> {
    throw new Error('I am bad executor');
  }
}

export const customWorkflowExecutor = new CustomWorkflowExecutor();
export const badWorkflowExecutor = new BadWorkflowExecutor();
