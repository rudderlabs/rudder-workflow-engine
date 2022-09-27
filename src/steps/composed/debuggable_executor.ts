import { ExecutionBindings } from '../../types';
import { ComposableStepExecutor } from './composable_executor';
import { StepExecutor, StepOutput } from '../types';

/**
 * DebuggableStepExecutor logs the input and output of step and also
 * helps to set break points for debugging.
 */
export class DebuggableStepExecutor extends ComposableStepExecutor {
  constructor(nextExecutor: StepExecutor) {
    super(nextExecutor);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    this.getLogger().debug({ input });
    const output = await super.execute(input, executionBindings);
    this.getLogger().debug({ output });
    return output;
  }
}
