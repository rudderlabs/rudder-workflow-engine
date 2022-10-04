import { Logger } from 'pino';
import { Dictionary, ExecutionBindings } from '../../types';
import { BaseStepExecutor } from '../base';
import { Step, StepExecutor, StepOutput, StepType } from '../types';

/**
 * ComposableStepExecutor allows compose more logic
 * on top the given step executor.
 */
export class ComposableStepExecutor implements StepExecutor {
  private stepExecutor: StepExecutor;

  constructor(stepExecutor: StepExecutor) {
    this.stepExecutor = stepExecutor;
  }

  getBindings(): Dictionary<any> {
    return this.stepExecutor.getBindings();
  }

  getLogger(): Logger {
    return this.stepExecutor.getLogger();
  }

  getStep(): Step {
    return this.stepExecutor.getStep();
  }

  getStepName(): string {
    return this.stepExecutor.getStepName();
  }

  getBaseExecutor(): BaseStepExecutor {
    return this.stepExecutor.getBaseExecutor();
  }

  execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    return this.stepExecutor.execute(input, executionBindings);
  }
}
