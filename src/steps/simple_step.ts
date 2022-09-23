import { Dictionary, StepOutput } from "src/types";
import { StepExecutor } from "./step";

export class SimpleStepExecutor implements StepExecutor {
    
    constructor() {

    }
    init() {
        throw new Error("Method not implemented.");
    }
    validate() {}
    excute(input: any, bindings: Dictionary<any>): StepOutput {
        throw new Error("Method not implemented.");
    }
}