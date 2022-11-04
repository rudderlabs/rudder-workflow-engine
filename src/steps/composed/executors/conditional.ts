import jsonataBeta from '../../../external_dependencies/jsonata';
import { ExecutionBindings } from '../../../workflow/types';
import { ComposableStepExecutor } from './composable';
import { StepExecutor, StepOutput } from '../../types';

export class ConditionalStepExecutor extends ComposableStepExecutor {
  private readonly conditionExpression: jsonataBeta.Expression;

  constructor(condition: string, nextExecutor: StepExecutor) {
    super(nextExecutor);
    this.conditionExpression = jsonataBeta(condition);
  }

  private async shouldSkipStep(input: any, executionBindings: ExecutionBindings) {
    const allBindings = Object.assign({}, super.getBindings(), executionBindings);
    return !(await this.conditionExpression.evaluate(input, allBindings));
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    if (await this.shouldSkipStep(input, executionBindings)) {
      return { skipped: true };
    }
    return super.execute(input, executionBindings);
  }
}
