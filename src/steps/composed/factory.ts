import { TemplateStepExecutorFactory } from '../base';
import { StepExecutorFactory } from '../factory';
import { Step, StepExecutor } from '../types';
import { ConditionalStepExecutor } from './executors/conditional';
import { CustomInputStepExecutor } from './executors/custom_input';
import { DebuggableStepExecutor } from './executors/debuggable';
import { ErrorWrapStepExecutor } from './executors/error_wrap';
import { LoopStepExecutor } from './executors/loop';

export class ComposableExecutorFactory {
  static async create(
    step: Step,
    rootPath: string,
    stepExecutor: StepExecutor,
  ): Promise<StepExecutor> {
    if (step.loopOverInput) {
      stepExecutor = new LoopStepExecutor(stepExecutor);
    }

    if (step.inputTemplate) {
      stepExecutor = this.createCustomInputStepExecutor(step, stepExecutor);
    }

    if (step.condition) {
      stepExecutor = await this.createConditionalStepExecutor(step, rootPath, stepExecutor);
    }

    if (step.debug) {
      stepExecutor = new DebuggableStepExecutor(stepExecutor);
    }
    stepExecutor = new ErrorWrapStepExecutor(stepExecutor);
    return stepExecutor;
  }

  static createCustomInputStepExecutor(
    step: Step,
    stepExecutor: StepExecutor,
  ): CustomInputStepExecutor {
    const templateExecutor = TemplateStepExecutorFactory.create(
      stepExecutor.getWorkflow(),
      step,
      step.inputTemplate as string,
      stepExecutor.getBindings(),
      stepExecutor.getLogger(),
    );
    return new CustomInputStepExecutor(templateExecutor, stepExecutor);
  }

  static async createConditionalStepExecutor(
    step: Step,
    rootPath: string,
    thenExecutor: StepExecutor,
  ): Promise<ConditionalStepExecutor> {
    const condtionalExecutor = TemplateStepExecutorFactory.create(
      thenExecutor.getWorkflow(),
      step,
      step.condition as string,
      thenExecutor.getBindings(),
      thenExecutor.getLogger(),
    );
    let elseExecutor: StepExecutor | undefined;
    if (step.else) {
      elseExecutor = await StepExecutorFactory.create(
        thenExecutor.getWorkflow(),
        step.else,
        rootPath,
        thenExecutor.getBindings(),
        thenExecutor.getLogger(),
      );
    }
    return new ConditionalStepExecutor(condtionalExecutor, thenExecutor, elseExecutor);
  }
}
