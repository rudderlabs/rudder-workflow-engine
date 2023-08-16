import { ExecutionBindings } from '../../../workflow/types';
import { ErrorUtils } from '../../../common/';
import { BaseStepExecutor } from './base';
import { StepExecutor, StepExitAction, StepOutput, WorkflowStep } from '../../types';
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
  ) {
    try {
      return await childExector.execute(input, executionBindings);
    } catch (error: any) {
      throw ErrorUtils.createStepExecutionError(
        error.error,
        this.getStepName(),
        childExector.getStepName(),
      );
    }
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const workflowStepName = this.getStepName();
    executionBindings.outputs[workflowStepName] = {};
    let finalOutput: any;
    for (const childExecutor of this.stepExecutors) {
      const childStep = childExecutor.getStep();
      const { skipped, output } = await this.executeChildStep(
        childExecutor,
        input,
        executionBindings,
      );
      if (skipped) {
        continue;
      }
      executionBindings.outputs[workflowStepName][childExecutor.getStepName()] = output;
      finalOutput = output;
      if (childStep.onComplete === StepExitAction.Return) {
        break;
      }
    }
    return { outputs: executionBindings.outputs[workflowStepName], output: finalOutput };
  }
}
