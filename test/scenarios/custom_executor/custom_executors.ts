import {
  StepOutput,
  WorkflowEngine,
  ExecutionBindings,
  WorkflowExecutor,
  WorkflowOutput,
} from '../../../src';

class CustomWorkflowExecutor implements WorkflowExecutor {
  async execute(_engine: WorkflowEngine, _input: any): Promise<WorkflowOutput> {
    return {
      output: 'custom executor output',
    };
  }
}

export const customWorkflowExecutor = new CustomWorkflowExecutor();
