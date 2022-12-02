import { WorkflowEngine } from '../../../../workflow/engine';
import { ErrorUtils } from '../../../../common';
import { BaseStepExecutor } from '../../executors/base';
import { SimpleStep, StepOutput } from '../../../types';

export class ExternalWorkflowStepExecutor extends BaseStepExecutor {
  private readonly workflowEngine: WorkflowEngine;

  constructor(workflowEngine: WorkflowEngine, step: SimpleStep) {
    super(step);
    this.workflowEngine = workflowEngine;
  }

  async execute(input: any): Promise<StepOutput> {
    try {
      return await this.workflowEngine.execute(input);
    } catch (error: any) {
      throw ErrorUtils.createStepExecutionError(error, this.getStepName());
    }
  }
}
