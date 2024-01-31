import { SimpleStep, StepOutput, WorkflowEngine } from '../../../../common';
import { ErrorUtils } from '../../../../errors';
import { BaseStepExecutor } from '../../executors/base';

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
