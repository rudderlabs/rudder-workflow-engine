import { logger } from '../../../common';
import { ExecutionBindings, StepOutput } from '../../../common/types';
import { ComposableStepExecutor } from './composable';

/**
 * DebuggableStepExecutor logs the input and output of step and also
 * helps to set break points for debugging.
 */
export class DebuggableStepExecutor extends ComposableStepExecutor {
  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    logger.mustLog('input = ', JSON.stringify(input));
    logger.mustLog('bindings = ', JSON.stringify(executionBindings));
    const output = await super.execute(input, executionBindings);
    logger.mustLog('output = ', JSON.stringify(output));
    return output;
  }
}
