import { Logger } from "pino";
import { Dictionary, ExecutionBindings, Step, StepOutput } from "src/types";

export interface StepExecutor {
    getStepName(): string;
    getStep(): Step;
    getLogger(): Logger;
    getBindings(): Dictionary<any>;
    execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>
}

export type Template = {
    content?: string;
    path?: string
  }