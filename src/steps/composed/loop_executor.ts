import { StepExecutionError } from '../../errors';
import { ExecutionBindings } from '../../types';
import { ComposableStepExecutor } from './composable_executor';
import { StepExecutor, StepOutput } from '../types';
import { WorkflowUtils } from '../../utils';

export class LoopStepExecutor extends ComposableStepExecutor {
  constructor(nextExecutor: StepExecutor) {
    super(nextExecutor);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    if (!Array.isArray(input)) {
      throw new StepExecutionError('loopOverInput requires array input', 400, this.getStepName());
    }
    const output = await Promise.all(
      input.map(async (element) => {
        try {
          return await super.execute(element, executionBindings);
        } catch (error: any) {
          return {
            error: {
              status: WorkflowUtils.getErrorStatus(error),
              message: error.message,
            },
          };
        }
      }),
    );
    return { output };
  }
}
