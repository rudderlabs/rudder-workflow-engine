import { ExecutionBindings, StepOutput } from '../../../common/types';
import { ErrorUtils, StepExecutionError } from '../../../errors';
import { ComposableStepExecutor } from './composable';

export class ErrorWrapStepExecutor extends ComposableStepExecutor {
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
