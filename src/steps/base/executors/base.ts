import { ExecutionBindings, Step, StepExecutor, StepOutput } from '../../../common/types';

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

  abstract execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}
