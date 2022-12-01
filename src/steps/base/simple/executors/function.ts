import { Logger } from 'pino';
import { ExecutionBindings, Workflow } from '../../../../workflow/types';
import { Dictionary } from '../../../../common/types';
import { BaseStepExecutor } from '../../executors/base';
import { StepFunction, StepOutput, SimpleStep } from '../../../types';
import { StepCreationError } from '../../../../steps/errors';

export class FunctionStepExecutor extends BaseStepExecutor {
  private readonly fn: StepFunction;

  constructor(
    workflow: Workflow,
    step: SimpleStep,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ) {
    super(workflow, step, bindings, parentLogger.child({ type: 'Function' }));
    this.fn = FunctionStepExecutor.extractFunction(
      step.functionName as string,
      bindings,
      step.name,
    );
  }

  private static extractFunction(
    functionName: string,
    bindings: Dictionary<any>,
    stepName: string,
  ): StepFunction {
    if (typeof bindings[functionName] !== 'function') {
      throw new StepCreationError(`Invalid functionName: ${functionName}`, stepName);
    }
    return bindings[functionName] as StepFunction;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const allBindings = this.getAllExecutionBindings(executionBindings);
    return this.fn(input, allBindings);
  }
}
