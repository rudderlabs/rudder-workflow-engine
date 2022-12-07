import { ExecutionBindings } from '../../../workflow/types';
import { Step, StepExecutor, StepOutput } from '../../types';
export abstract class BaseStepExecutor implements StepExecutor {
  protected readonly step: Step;

  constructor(step: Step) {
    this.step = step;
  }

  getStep(): Step {
    return this.step;
  }

  getStepName(): string {
    return this.step.name;
  }

  getBaseExecutor(): BaseStepExecutor {
    return this;
  }

  abstract execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}
