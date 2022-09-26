import { ExecutionBindings } from '../../types';
import { ComposableStepExecutor } from './composable_executor';
import { StepExecutor, StepOutput } from '../types';

/**
 * DebuggableStepExecutor logs the input and output of step and also
 * helps to set break points for debugging.
 */
export class DebuggableStepExecutor extends ComposableStepExecutor {
  constructor(stepExecutor: StepExecutor) {
    super("debug", stepExecutor);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    super.getLogger().debug('input', input);
    const output = await super.execute(input, executionBindings);
    super.getLogger().debug('output', output);
    return output;
  }
}
