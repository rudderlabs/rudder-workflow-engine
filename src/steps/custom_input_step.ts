import { ExecutionBindings, StepOutput } from "../types";
import { DecoratableStepExecutor } from "./decoratable_step";
import { StepExecutor } from "./interface";

export class CustomInputStepExecutor extends DecoratableStepExecutor {
    constructor(stepExecutor: StepExecutor) {
        super(stepExecutor);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        const customInput = await super.prepareInput(input, executionBindings);
        return super.execute(customInput, executionBindings);
    }
}