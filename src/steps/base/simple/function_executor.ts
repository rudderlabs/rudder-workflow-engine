import { Logger } from 'pino';
import { WorkflowEngineError } from '../../../errors';
import { Dictionary, ExecutionBindings } from '../../../types';
import { BaseStepExecutor } from '../base_executor';
import { StepFunction, StepOutput, SimpleStep } from '../../types';

export class FunctionStepExecutor extends BaseStepExecutor {
  private readonly fn: StepFunction;

  constructor(step: SimpleStep, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger) {
    super(step, rootPath, bindings, parentLogger.child({ type: 'Function' }));
    this.fn = this.prepareFunction(step);
  }

  private prepareFunction(step: SimpleStep): StepFunction {
    if (!step.functionName) {
      throw new WorkflowEngineError(
        'functionName required for FunctionStepExecutor',
        400,
        step.name,
      );
    }
    if (typeof this.bindings[step.functionName] !== 'function') {
      throw new WorkflowEngineError('Invalid functionName', 400, this.step.name);
    }
    return this.bindings[step.functionName] as StepFunction;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const allBindings = Object.assign(
      {},
      this.bindings,
      executionBindings,
      this.getLoggerBindings(),
    );
    return this.fn(input, allBindings);
  }
}
