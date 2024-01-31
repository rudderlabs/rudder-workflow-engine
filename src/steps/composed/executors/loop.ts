import { ExecutionBindings, LoopStepOutput, StepOutput } from '../../../common/types';
import { ErrorUtils, StepExecutionError } from '../../../errors';
import { ComposableStepExecutor } from './composable';

export class LoopStepExecutor extends ComposableStepExecutor {
  private async executeForInputElement(
    element: any,
    executionBindings: ExecutionBindings,
  ): Promise<StepOutput> {
    try {
      return await super.execute(element, executionBindings);
    } catch (error: any) {
      const stepExecutionError = ErrorUtils.createStepExecutionError(error, this.getStepName());
      return {
        error: {
          message: stepExecutionError.message,
          status: stepExecutionError.status,
          error: stepExecutionError,
          originalError: stepExecutionError.originalError,
        },
      };
    }
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<LoopStepOutput> {
    if (!Array.isArray(input)) {
      throw new StepExecutionError('loopOverInput requires array input', 400, {
        stepName: this.getStepName(),
      });
    }
    const promises: Promise<StepOutput>[] = new Array(input.length);
    for (let i = 0; i < input.length; i += 1) {
      promises[i] = this.executeForInputElement(input[i], executionBindings);
    }
    return { output: await Promise.all(promises) };
  }
}
