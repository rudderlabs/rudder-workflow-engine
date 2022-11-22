import { ExecutionBindings } from '../../../workflow/types';
import { ComposableStepExecutor } from './composable';
import { Step, StepExecutor, StepOutput, TemplateStepExecutor } from '../../types';
import { TemplateStepExecutorFactory } from '../../../steps/base/simple/executors/template';

type CustomData = {
  input: any;
  context: any;
};

/**
 * CustomInputStepExecutor customizes the input, context the
 * and then invokes step executor with the custom data
 */
export class CustomDataStepExecutor extends ComposableStepExecutor {
  private readonly inputTemplateExecutor?: TemplateStepExecutor;
  private readonly contextTemplateExecutor?: TemplateStepExecutor;

  constructor(step: Step, nextExecutor: StepExecutor) {
    super(nextExecutor);
    if (step.inputTemplate) {
      this.inputTemplateExecutor = TemplateStepExecutorFactory.create(
        nextExecutor.getWorkflow(),
        step,
        step.inputTemplate,
        nextExecutor.getBindings(),
        nextExecutor.getLogger(),
      );
    }
    if (step.contextTemplate) {
      this.contextTemplateExecutor = TemplateStepExecutorFactory.create(
        nextExecutor.getWorkflow(),
        step,
        step.contextTemplate,
        nextExecutor.getBindings(),
        nextExecutor.getLogger(),
      );
    }
  }

  private async prepareData(input: any, executionBindings: ExecutionBindings): Promise<CustomData> {
    const customData: CustomData = { input, context: executionBindings.context };
    if (this.inputTemplateExecutor) {
      const result = await this.inputTemplateExecutor.execute(input, executionBindings);
      customData.input = result.output;
    }
    if (this.contextTemplateExecutor) {
      const result = await this.contextTemplateExecutor.execute(input, executionBindings);
      customData.context = result.output;
    }
    return customData;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const customData = await this.prepareData(input, executionBindings);
    const newExecutionBindings = { ...executionBindings, context: customData.context };
    return super.execute(customData.input, newExecutionBindings);
  }
}
