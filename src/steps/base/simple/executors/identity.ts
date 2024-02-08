import { StepOutput } from '../../../../common';
import { BaseStepExecutor } from '../../executors';

export class IdentityStepExecutor extends BaseStepExecutor {
  // eslint-disable-next-line class-methods-use-this
  async execute(input: any): Promise<StepOutput> {
    return { output: input };
  }
}
