import jsonata from 'jsonata';
import { ExecutionBindings } from '../../types';
import { ComposableStepExecutor } from './composable_executor';
import { StepExecutor, StepOutput } from '../types';

export class ConditionalStepExecutor extends ComposableStepExecutor {
  private readonly conditionExpression: jsonata.Expression;

  constructor(condition: string, nextExecutor: StepExecutor) {
    super(nextExecutor);
    this.conditionExpression = jsonata(condition);
  }

  private shouldSkipStep(input: any, executionBindings: ExecutionBindings) {
    const allBindings = Object.assign({}, super.getBindings(), executionBindings);
    return !this.conditionExpression.evaluate(input, allBindings);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    if (this.shouldSkipStep(input, executionBindings)) {
      return { skipped: true };
    }
    return super.execute(input, executionBindings);
  }
}
