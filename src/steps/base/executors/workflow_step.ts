import { Logger } from 'pino';
import { StepExecutionError } from '../../errors';
import { ExecutionBindings, Workflow } from '../../../workflow/types';
import { Dictionary } from '../../../common/types';
import { WorkflowUtils } from '../../../workflow/utils';
import { BaseStepExecutor } from './base';
import { StepExecutor, StepOutput, WorkflowStep } from '../../types';
export class WorkflowStepExecutor extends BaseStepExecutor {
  private readonly stepExecutors: StepExecutor[];
  constructor(
    workflow: Workflow,
    stepExecutors: StepExecutor[],
    step: WorkflowStep,
    bindings: Dictionary<any>,
    logger: Logger,
  ) {
    super(workflow, step, bindings, logger);
    this.stepExecutors = stepExecutors;
  }

  getStepExecutor(childStepName: string): StepExecutor {
    const stepExecutor = this.stepExecutors.find(
      (stepExecutor) => stepExecutor.getStepName() === childStepName,
    );
    if (!stepExecutor) {
      throw new Error(`${this.getStepName()}:${childStepName} was not found`);
    }
    return stepExecutor;
  }

  async executeChildStep(
    childExector: StepExecutor,
    input: any,
    executionBindings: ExecutionBindings,
  ) {
    try {
      return await childExector.execute(input, executionBindings);
    } catch (error: any) {
      throw new StepExecutionError(
        error.message,
        WorkflowUtils.getErrorStatus(error),
        this.getStepName(),
        error.stepName,
        error.error,
      );
    }
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    executionBindings.outputs[this.getStepName()] = {};
    let finalOutput: any;
    for (const childExecutor of this.stepExecutors) {
      const { skipped, output } = await this.executeChildStep(
        childExecutor,
        input,
        executionBindings,
      );
      if (!skipped) {
        executionBindings.outputs[this.getStepName()][childExecutor.getStepName()] = output;
        finalOutput = output;
      }
    }
    return { outputs: executionBindings.outputs[this.getStepName()], output: finalOutput };
  }
}
