import { CustomStep, ExecutionBindings, StepOutput } from '../../../common/types';
import { CustomStepExecutor } from '../../types';
import { BaseStepExecutor } from '../executors';

export class BaseCustomStepExecutor extends BaseStepExecutor {
  readonly executor: CustomStepExecutor;

  constructor(step: CustomStep, executor: CustomStepExecutor) {
    super(step);
    this.executor = executor;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const output = await this.executor.execute(
      input,
      executionBindings,
      (this.step as CustomStep).params,
    );
    return { output };
  }
}
