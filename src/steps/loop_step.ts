import { CustomError } from "../errors";
import { ExecutionBindings, StepOutput } from "../types";
import { DecoratableStepExecutor } from "./decoratable_step";
import { StepExecutor } from "./interface";

export class LoopStepExecutor extends DecoratableStepExecutor {
    constructor(stepExecutor: StepExecutor) {
        super(stepExecutor);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        if (!Array.isArray(input)) {
            throw new CustomError("loopOverInput requires array input", 400,)
        }
        const output = await Promise.all(input.map(async element => {
            try {
                return await super.execute(element, executionBindings);
            } catch (error: any) {
                return {
                    error: {
                        status: error.response?.status || 500,
                        message: error.message,
                    }
                }
            }
        }));
        return { output }
    }
}