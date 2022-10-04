import { Logger } from 'pino';
import { WorkflowEngine } from '../../../workflow';
import { Dictionary, ExecutionBindings } from '../../../types';
import { BaseStepExecutor } from '../base_executor';
import { SimpleStep, StepOutput } from '../../types';

export class ExternalWorkflowStepExecutor extends BaseStepExecutor {
  private readonly workflowEngine: WorkflowEngine;

  constructor(
    workflowEngine: WorkflowEngine,
    step: SimpleStep,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ) {
    super(step, rootPath, bindings, parentLogger.child({ type: 'ExternalWorkflow' }));
    this.workflowEngine = workflowEngine;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    return this.workflowEngine.execute(input, executionBindings.context);
  }
}
