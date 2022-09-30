import jsonata from 'jsonata';
import { WorkflowUtils } from '../../utils';
import { ExecutionBindings } from '../../types';
import { ComposableStepExecutor } from './composable_executor';
import { StepExecutor, StepOutput } from '../types';

/**
 * CustomInputStepExecutor customizes the input the
 * and then invokes step executor with the custom input
 */
export class CustomInputStepExecutor extends ComposableStepExecutor {
  private readonly inputTemplateExpression: jsonata.Expression;

  constructor(inputTemplate: string, nextExecutor: StepExecutor) {
    super(nextExecutor);
    this.inputTemplateExpression = jsonata(inputTemplate);
  }

  private async prepareInput(input: any, executionBindings: ExecutionBindings): Promise<any> {
    const allBindings = Object.assign({}, super.getBindings(), executionBindings);
    return WorkflowUtils.jsonataPromise(this.inputTemplateExpression, input, allBindings);
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const customInput = await this.prepareInput(input, executionBindings);
    return super.execute(customInput, executionBindings);
  }
}
