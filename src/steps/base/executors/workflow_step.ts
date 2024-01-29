import {
  ExecutionBindings,
  StepExecutor,
  StepExitAction,
  StepOutput,
  WorkflowStep,
} from '../../../common/types';
import { ErrorUtils } from '../../../errors';
import { BaseStepExecutor } from './base';

export class WorkflowStepExecutor extends BaseStepExecutor {
  private readonly stepExecutors: StepExecutor[];

  constructor(step: WorkflowStep, stepExecutors: StepExecutor[]) {
    super(step);
    this.stepExecutors = stepExecutors;
  }

  async executeChildStep(
    childExector: StepExecutor,
    input: any,
    executionBindings: ExecutionBindings,
  ): Promise<StepOutput> {
    try {
      return await childExector.execute(input, executionBindings);
    } catch (error: any) {
      throw ErrorUtils.createStepExecutionError(
        error,
        this.getStepName(),
        childExector.getStepName(),
      );
    }
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const workflowStepName = this.getStepName();
    const newExecutionBindings = executionBindings;
    newExecutionBindings.outputs[workflowStepName] = {};
    let finalOutput: any;

    // eslint-disable-next-line no-restricted-syntax
    for (const childExecutor of this.stepExecutors) {
      const childStep = childExecutor.getStep();
      // eslint-disable-next-line no-await-in-loop
      const { skipped, output } = await this.executeChildStep(
        childExecutor,
        input,
        executionBindings,
      );
      if (!skipped) {
        newExecutionBindings.outputs[workflowStepName][childExecutor.getStepName()] = output;
        finalOutput = output;
        if (childStep.onComplete === StepExitAction.Return) {
          break;
        }
      }
    }
    return { outputs: executionBindings.outputs[workflowStepName], output: finalOutput };
  }
}
