import { ExecutionBindings, StepOutput } from "src/types";
import { DecoratableStepExecutor } from "./decoratable_step";
import { StepExecutor } from "./interface";

/**
 * This is to set the break points when step using debug flag
 */
export class DebuggableStepExecutor extends DecoratableStepExecutor {
    constructor(stepExecutor: StepExecutor) {
        super(stepExecutor);
    }

    shouldSkip(input: any, executionBindings: ExecutionBindings): boolean {
        return super.shouldSkip(input, executionBindings);
    }

    prepareInput(input: any, executionBindings: ExecutionBindings): Promise<any> {
        return super.prepareInput(input, executionBindings);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        super.getLogger().debug("input", input);
        const output = await super.execute(input, executionBindings)
        super.getLogger().debug("output", output);
        return output;
    }
}