import { Dictionary, StepInternal, StepOutput } from "src/types";

export interface StepExecutor {
    validate();
    excute(input: any, bindings: Dictionary<any>): StepOutput;
    init();
    get(): StepInternal;
}