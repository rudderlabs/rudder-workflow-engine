import { StepExecutor, WorkflowOptionsInternal } from '../../common/types';
import { TemplateStepExecutorFactory } from '../base/simple/executors/template';
import { ConditionalStepExecutor } from './executors/conditional';
import { CustomInputStepExecutor } from './executors/custom_input';
import { DebuggableStepExecutor } from './executors/debuggable';
import { ErrorWrapStepExecutor } from './executors/error_wrap';
import { LoopStepExecutor } from './executors/loop';

export class ComposableExecutorFactory {
  static async create(
    stepExecutor: StepExecutor,
    options: WorkflowOptionsInternal,
  ): Promise<StepExecutor> {
    const step = stepExecutor.getStep();
    let composedStepExecutor = stepExecutor;
    if (step.loopOverInput) {
      composedStepExecutor = this.createLoopStepExecutor(composedStepExecutor, options);
    }

    if (step.inputTemplate) {
      composedStepExecutor = this.createCustomInputStepExecutor(composedStepExecutor, options);
    }

    if (step.condition) {
      composedStepExecutor = await this.createConditionalStepExecutor(
        composedStepExecutor,
        options,
      );
    }

    if (step.debug) {
      composedStepExecutor = new DebuggableStepExecutor(composedStepExecutor);
    }
    composedStepExecutor = new ErrorWrapStepExecutor(composedStepExecutor);
    return composedStepExecutor;
  }

  static createCustomInputStepExecutor(
    stepExecutor: StepExecutor,
    options: WorkflowOptionsInternal,
  ): CustomInputStepExecutor {
    const step = stepExecutor.getStep();
    const templateExecutor = TemplateStepExecutorFactory.create(
      step,
      step.inputTemplate as string,
      options,
    );
    return new CustomInputStepExecutor(templateExecutor, stepExecutor);
  }

  static async createConditionalStepExecutor(
    thenExecutor: StepExecutor,
    options: WorkflowOptionsInternal,
  ): Promise<ConditionalStepExecutor> {
    const step = thenExecutor.getStep();
    const condtionalExecutor = TemplateStepExecutorFactory.create(
      step,
      step.condition as string,
      options,
    );
    let elseExecutor: StepExecutor | undefined;
    if (step.else) {
      const { StepExecutorFactory } = await import('../factory' as string);
      elseExecutor = await StepExecutorFactory.create(step.else, options);
    }
    return new ConditionalStepExecutor(condtionalExecutor, thenExecutor, elseExecutor);
  }

  static createLoopStepExecutor(
    stepExecutor: StepExecutor,
    options: WorkflowOptionsInternal,
  ): LoopStepExecutor {
    const step = stepExecutor.getStep();
    let wrappedStepExecutor = stepExecutor;
    if (step.loopCondition) {
      const condtionalExecutor = TemplateStepExecutorFactory.create(
        step,
        step.loopCondition,
        options,
      );
      wrappedStepExecutor = new ConditionalStepExecutor(condtionalExecutor, wrappedStepExecutor);
    }
    return new LoopStepExecutor(wrappedStepExecutor);
  }
}
