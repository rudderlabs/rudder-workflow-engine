import { ExecutionBindings } from '../../../workflow/types';
import { Step, StepExecutor, StepOutput } from '../../types';

/**
 * ComposableStepExecutor allows compose more logic
 * on top the given step executor.
 */
export class ComposableStepExecutor implements StepExecutor {
  private stepExecutor: StepExecutor;

  constructor(stepExecutor: StepExecutor) {
    this.stepExecutor = stepExecutor;
  }

  getStep(): Step {
    return this.stepExecutor.getStep();
  }

  getStepName(): string {
    return this.stepExecutor.getStepName();
  }

  execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    return this.stepExecutor.execute(input, executionBindings);
  }
}
