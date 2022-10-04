import { Step, StepExecutor } from "../types";
import { ConditionalStepExecutor } from "./conditional_executor";
import { CustomInputStepExecutor } from "./custom_input_executor";
import { DebuggableStepExecutor } from "./debuggable_executor";
import { ErrorWrapStepExecutor } from "./error_wrap_executor";
import { LoopStepExecutor } from "./loop_executor";

export class ComposableExecutorFactory {
    static create(step :Step, stepExecutor: StepExecutor): StepExecutor {
        if (step.loopOverInput) {
            stepExecutor = new LoopStepExecutor(stepExecutor);
        }

        if (step.inputTemplate) {
            stepExecutor = new CustomInputStepExecutor(step.inputTemplate, stepExecutor);
        }

        if (step.condition) {
            stepExecutor = new ConditionalStepExecutor(step.condition, stepExecutor);
        }

        if (step.debug) {
            stepExecutor = new DebuggableStepExecutor(stepExecutor);
        }
        stepExecutor = new ErrorWrapStepExecutor(stepExecutor);
        return stepExecutor;
    }
}