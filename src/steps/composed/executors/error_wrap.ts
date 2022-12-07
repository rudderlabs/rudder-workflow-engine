import { ExecutionBindings } from '../../../workflow/types';
import { ComposableStepExecutor } from './composable';
import { StepExecutor, StepOutput } from '../../types';
import { StepExecutionError } from '../../errors';
import { ErrorUtils } from '../../../common';

export class ErrorWrapStepExecutor extends ComposableStepExecutor {
  constructor(nextExecutor: StepExecutor) {
    super(nextExecutor);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    try {
      return await super.execute(input, executionBindings);
    } catch (error: any) {
      if (error instanceof StepExecutionError) {
        throw error;
      }
      throw ErrorUtils.createStepExecutionError(error, this.getStepName());
    }
  }
}
