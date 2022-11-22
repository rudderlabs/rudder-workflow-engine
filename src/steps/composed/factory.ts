import { Step, StepExecutor } from '../types';
import { ConditionalStepExecutor } from './executors/conditional';
import { CustomDataStepExecutor } from './executors/custom_data';
import { DebuggableStepExecutor } from './executors/debuggable';
import { ErrorWrapStepExecutor } from './executors/error_wrap';
import { LoopStepExecutor } from './executors/loop';

export class ComposableExecutorFactory {
  static create(step: Step, stepExecutor: StepExecutor): StepExecutor {
    if (step.loopOverInput) {
      stepExecutor = new LoopStepExecutor(stepExecutor);
    }

    if (step.inputTemplate || step.contextTemplate) {
      stepExecutor = new CustomDataStepExecutor(step, stepExecutor);
    }

    if (step.condition) {
      stepExecutor = new ConditionalStepExecutor(step, stepExecutor);
    }

    if (step.debug) {
      stepExecutor = new DebuggableStepExecutor(stepExecutor);
    }
    stepExecutor = new ErrorWrapStepExecutor(stepExecutor);
    return stepExecutor;
  }
}
