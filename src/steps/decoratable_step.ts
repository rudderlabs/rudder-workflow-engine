import { Logger } from "pino";
import { Dictionary, ExecutionBindings } from "../types";
import { Step, StepExecutor, StepOutput } from "./types";

export class DecoratableStepExecutor implements StepExecutor {
    private stepExecutor: StepExecutor;

    constructor(stepExecutor: StepExecutor) {
        this.stepExecutor = stepExecutor;
    }
    
    getStepType(): string {
        return this.stepExecutor.getStepType();
    }

    getBindings(): Dictionary<any> {
        return this.stepExecutor.getBindings();
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

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        return this.stepExecutor.execute(input, executionBindings)
    }
}