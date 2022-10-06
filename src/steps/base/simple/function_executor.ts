import { Logger } from 'pino';
import { ExecutionBindings } from '../../../workflow/types';
import { Dictionary } from '../../../common/types';
import { BaseStepExecutor } from '../base_executor';
import { StepFunction, StepOutput, SimpleStep } from '../../types';

export class FunctionStepExecutor extends BaseStepExecutor {
  private readonly fn: StepFunction;

  constructor(fn: StepFunction, step: SimpleStep, bindings: Dictionary<any>, parentLogger: Logger) {
    super(step, bindings, parentLogger.child({ type: 'Function' }));
    this.fn = fn;
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
