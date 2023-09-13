import { CustomStep, CustomStepExecutor, StepOutput } from '../../../steps/types';
import { ExecutionBindings } from '../../../workflow';
import { BaseStepExecutor } from '../executors';
import { Executor } from '../../../common';

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
