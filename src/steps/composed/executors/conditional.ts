import { ExecutionBindings, StepExecutor, StepOutput } from '../../../common/types';
import { ComposableStepExecutor } from './composable';

export class ConditionalStepExecutor extends ComposableStepExecutor {
  private readonly conditionExecutor: StepExecutor;

  private readonly thenExecutor: StepExecutor;

  private readonly elseExecutor?: StepExecutor;

  constructor(
    conditionExecutor: StepExecutor,
    thenExecutor: StepExecutor,
    elseExecutor?: StepExecutor,
  ) {
    super(thenExecutor);
    this.conditionExecutor = conditionExecutor;
    this.thenExecutor = thenExecutor;
    this.elseExecutor = elseExecutor;
  }

  private async shouldExecuteStep(
    input: any,
    executionBindings: ExecutionBindings,
  ): Promise<boolean> {
    const result = await this.conditionExecutor.execute(input, executionBindings);
    return result.output;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const shouldExecuteStep = await this.shouldExecuteStep(input, executionBindings);
    if (shouldExecuteStep) {
      return this.thenExecutor.execute(input, executionBindings);
    }
    if (this.elseExecutor) {
      return this.elseExecutor.execute(input, executionBindings);
    }
    return { skipped: true };
  }
}
