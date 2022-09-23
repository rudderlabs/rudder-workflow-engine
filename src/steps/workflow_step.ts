import { Dictionary, StepOutput } from "src/types";
import { StepExecutor } from "./step";

export class WorkflowStepExecutor implements StepExecutor {
    init() {
        throw new Error("Method not implemented.");
    }  
    validate(){} 
    excute(input: any, bindings: Dictionary<any> | undefined): StepOutput {
        throw new Error("Method not implemented.");
    }   
}