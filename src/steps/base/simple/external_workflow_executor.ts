import { Logger } from 'pino';
import { join } from 'path';
import { WorkflowUtils } from '../../../utils';
import { WorkflowEngine } from '../../../workflow';
import { Dictionary, ExecutionBindings, Workflow } from '../../../types';
import { BaseStepExecutor } from '../base_executor';
import { SimpleStep, StepOutput } from '../../types';
import { WorkflowEngineError } from '../../../errors';

export class ExternalWorkflowStepExecutor extends BaseStepExecutor {
  private readonly workflowEngine: WorkflowEngine;

  constructor(step: SimpleStep, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger) {
    super(step, rootPath, bindings, parentLogger.child({ type: 'ExternalWorkflow' }));
    this.workflowEngine = this.prepareExternalWorkflowEngine(step);
  }

  private prepareExternalWorkflowEngine(step: SimpleStep): WorkflowEngine {
    if (!step.externalWorkflow) {
      throw new WorkflowEngineError(
        'externalWorkflow required for ExternalWorkflowStepExecutor',
        400,
        step.name,
      );
    }
    const workflowPath = join(this.rootPath, step.externalWorkflow.path);
    const workflow = WorkflowUtils.createFromFilePath<Workflow>(workflowPath);
    const externalWorkflowRootPath = join(this.rootPath, step.externalWorkflow.rootPath || '');
    return new WorkflowEngine(workflow, externalWorkflowRootPath);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    return this.workflowEngine.execute(input, executionBindings.context);
  }
}
