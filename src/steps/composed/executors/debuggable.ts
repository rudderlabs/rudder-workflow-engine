import { ComposableStepExecutor } from './composable';
import { StepExecutor, StepOutput } from '../../types';
import { ExecutionBindings } from '../../../workflow/types';
import { logger } from '../../../common';

/**
 * DebuggableStepExecutor logs the input and output of step and also
 * helps to set break points for debugging.
 */
export class DebuggableStepExecutor extends ComposableStepExecutor {
  constructor(nextExecutor: StepExecutor) {
    super(nextExecutor);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    logger.mustDebug('input = ', JSON.stringify(input));
    logger.mustDebug('bindings = ', JSON.stringify(executionBindings));
    const output = await super.execute(input, executionBindings);
    logger.mustDebug('output = ', JSON.stringify(output));
    return output;
  }
}
