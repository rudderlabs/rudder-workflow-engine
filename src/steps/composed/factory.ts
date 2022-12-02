import { WorkflowOptionsInternal } from 'src/workflow';
import { TemplateStepExecutorFactory } from '../base';
import { StepExecutorFactory } from '../factory';
import { StepExecutor } from '../types';
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
    if (step.loopOverInput) {
      stepExecutor = new LoopStepExecutor(stepExecutor);
    }

    if (step.inputTemplate) {
      stepExecutor = this.createCustomInputStepExecutor(stepExecutor, options);
    }

    if (step.condition) {
      stepExecutor = await this.createConditionalStepExecutor(stepExecutor, options);
    }

    if (step.debug) {
      stepExecutor = new DebuggableStepExecutor(stepExecutor);
    }
    stepExecutor = new ErrorWrapStepExecutor(stepExecutor);
    return stepExecutor;
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
      elseExecutor = await StepExecutorFactory.create(step.else, options);
    }
    return new ConditionalStepExecutor(condtionalExecutor, thenExecutor, elseExecutor);
  }
}
