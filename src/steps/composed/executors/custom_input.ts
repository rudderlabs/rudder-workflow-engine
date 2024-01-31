import { ExecutionBindings, StepExecutor, StepOutput } from '../../../common/types';
import { TemplateStepExecutor } from '../../types';
import { ComposableStepExecutor } from './composable';

/**
 * CustomInputStepExecutor customizes the input and
 * then invokes step executor with the new input.
 */
export class CustomInputStepExecutor extends ComposableStepExecutor {
  private readonly inputTemplateExecutor: TemplateStepExecutor;

  constructor(inputTemplateExecutor: TemplateStepExecutor, nextExecutor: StepExecutor) {
    super(nextExecutor);
    this.inputTemplateExecutor = inputTemplateExecutor;
  }

  private async prepareData(input: any, executionBindings: ExecutionBindings): Promise<any> {
    const result = await this.inputTemplateExecutor.execute(input, executionBindings);
    return result.output;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const customInput = await this.prepareData(input, executionBindings);
    return super.execute(customInput, executionBindings);
  }
}
