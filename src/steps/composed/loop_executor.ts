import { WorkflowExecutionError } from "../../errors";
import { ExecutionBindings } from "../../types";
import { ComposableStepExecutor } from "./composable_executor";
import { StepExecutor, StepOutput } from "../types";

export class LoopStepExecutor extends ComposableStepExecutor {
    constructor(stepExecutor: StepExecutor) {
        super("loop", stepExecutor);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        if (!Array.isArray(input)) {
            throw new WorkflowExecutionError("loopOverInput requires array input", 400,)
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