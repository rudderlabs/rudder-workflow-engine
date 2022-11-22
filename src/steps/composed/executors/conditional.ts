import { ExecutionBindings } from '../../../workflow/types';
import { ComposableStepExecutor } from './composable';
import { Step, StepExecutor, StepOutput, TemplateStepExecutor } from '../../types';
import { TemplateStepExecutorFactory } from '../../../steps/base/simple/executors/template';

export class ConditionalStepExecutor extends ComposableStepExecutor {
  private readonly templateExecutor: TemplateStepExecutor;

  constructor(step: Step, nextExecutor: StepExecutor) {
    super(nextExecutor);
    this.templateExecutor = TemplateStepExecutorFactory.create(
      nextExecutor.getWorkflow(),
      step,
      step.condition as string,
      nextExecutor.getBindings(),
      nextExecutor.getLogger(),
    );
  }

  private async shouldExecuteStep(
    input: any,
    executionBindings: ExecutionBindings,
  ): Promise<boolean> {
    const result = await this.templateExecutor.execute(input, executionBindings);
    return result.output;
  }

  async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
    const shouldExecuteStep = await this.shouldExecuteStep(input, executionBindings);
    if (shouldExecuteStep) {
      return super.execute(input, executionBindings);
    }
    return { skipped: true };
  }
}
