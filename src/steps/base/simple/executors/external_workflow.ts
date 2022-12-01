import { Logger } from 'pino';
import { WorkflowEngine } from '../../../../workflow/engine';
import { ErrorUtils } from '../../../../common';
import { BaseStepExecutor } from '../../executors/base';
import { SimpleStep, StepOutput } from '../../../types';
import { ExecutionBindings, Workflow } from '../../../../workflow/types';

export class ExternalWorkflowStepExecutor extends BaseStepExecutor {
  private readonly workflowEngine: WorkflowEngine;

  constructor(
    workflow: Workflow,
    workflowEngine: WorkflowEngine,
    step: SimpleStep,
    parentLogger: Logger,
  ) {
    super(
      workflow,
      step,
      workflowEngine.bindings,
      parentLogger.child({ type: 'ExternalWorkflow' }),
    );
    this.workflowEngine = workflowEngine;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    try {
      return await this.workflowEngine.execute(input, executionBindings);
    } catch (error: any) {
      throw ErrorUtils.createStepExecutionError(error, this.getStepName());
    }
  }
}
