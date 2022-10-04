import { Logger } from 'pino';
import { WorkflowEngine } from '../../../workflow';
import { Dictionary, ExecutionBindings } from '../../../types';
import { BaseStepExecutor } from '../base_executor';
import { SimpleStep, StepOutput } from '../../types';
import { StepExecutionError } from '../../errors';

export class ExternalWorkflowStepExecutor extends BaseStepExecutor {
  private readonly workflowEngine: WorkflowEngine;

  constructor(
    workflowEngine: WorkflowEngine,
    step: SimpleStep,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ) {
    super(step, bindings, parentLogger.child({ type: 'ExternalWorkflow' }));
    this.workflowEngine = workflowEngine;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    try{
      return await this.workflowEngine.execute(input, executionBindings.context);
    } catch(error: any) {
      throw new StepExecutionError(error.message, error.status, this.getStepName(), undefined, error);
    }
  }
}
