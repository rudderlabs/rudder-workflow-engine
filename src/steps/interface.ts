import { Logger } from "pino";
import { ExecutionBindings, Step, StepOutput } from "src/types";

export interface StepExecutor {
    getStepName(): string;
    getStep(): Step;
    getLogger(): Logger;
    shouldSkip(input: any, executionBindings: ExecutionBindings): boolean;
    prepareInput(input: any, executionBindings: ExecutionBindings): Promise<any>;
    execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>
}