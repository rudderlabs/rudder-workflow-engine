import { Logger } from "pino";
import { ExecutionBindings, Step, StepOutput } from "../types";
import { StepExecutor } from "./interface";

export class DecoratableStepExecutor implements StepExecutor {
    private stepExecutor: StepExecutor;

    constructor(stepExecutor: StepExecutor) {
        this.stepExecutor = stepExecutor;
    }
    getLogger(): Logger {
        return this.stepExecutor.getLogger();
    }

    getStep(): Step {
        return this.stepExecutor.getStep();
    }

    getStepName(): string {
        return this.stepExecutor.getStepName();
    }

    shouldSkip(input: any, executionBindings: ExecutionBindings): boolean {
        return this.stepExecutor.shouldSkip(input, executionBindings);
    }

    prepareInput(input: any, executionBindings: ExecutionBindings): Promise<any> {
        return this.stepExecutor.prepareInput(input, executionBindings);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        return this.stepExecutor.execute(input, executionBindings)
    }
}