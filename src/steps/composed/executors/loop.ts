import { StepExecutionError } from '../../errors';
import { ExecutionBindings } from '../../../workflow/types';
import { ComposableStepExecutor } from './composable';
import { StepExecutor, StepOutput } from '../../types';

export class LoopStepExecutor extends ComposableStepExecutor {
  constructor(nextExecutor: StepExecutor) {
    super(nextExecutor);
  }

  private async executeForInputElement(
    element: any,
    executionBindings: ExecutionBindings,
  ): Promise<StepOutput> {
    try {
      return await super.execute(element, executionBindings);
    } catch (error: any) {
      return {
        error: {
          message: error.message,
          status: error.status,
          originalError: error.originalError,
        },
      };
    }
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    if (!Array.isArray(input)) {
      throw new StepExecutionError('loopOverInput requires array input', 400, this.getStepName());
    }
    const promises = input.map((element) =>
      this.executeForInputElement(element, executionBindings),
    );
    return { output: await Promise.all(promises) };
  }
}
