import { ExecutionBindings, StepOutput } from "../types";
import { DecoratableStepExecutor } from "./decoratable_step";
import { StepExecutor } from "./interface";

export class ConditionalStepExecutor extends DecoratableStepExecutor {
    constructor(stepExecutor: StepExecutor) {
        super(stepExecutor);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        if(super.shouldSkip(input, executionBindings)) {
            return { skipped: true};
        }
        return super.execute(input, executionBindings);
    }

}