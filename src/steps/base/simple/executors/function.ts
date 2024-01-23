import { ExecutionBindings } from '../../../../workflow/types';
import { BaseStepExecutor } from '../../executors/base';
import { StepFunction, StepOutput, SimpleStep } from '../../../types';
import { StepCreationError } from '../../../errors';

export class FunctionStepExecutor extends BaseStepExecutor {
  private readonly fn: StepFunction;

  constructor(step: SimpleStep, bindings: Record<string, any>) {
    super(step);
    this.fn = FunctionStepExecutor.extractFunction(
      step.functionName as string,
      bindings,
      step.name,
    );
  }

  private static extractFunction(
    functionName: string,
    bindings: Record<string, any>,
    stepName: string,
  ): StepFunction {
    if (typeof bindings[functionName] !== 'function') {
      throw new StepCreationError(`Invalid functionName: ${functionName}`, stepName);
    }
    return bindings[functionName] as StepFunction;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    return this.fn(input, executionBindings);
  }
}
