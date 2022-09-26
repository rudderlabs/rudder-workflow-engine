import { Logger } from "pino";
import { WorkflowExecutionError } from "../../../errors";
import { Dictionary, ExecutionBindings } from "../../../types";
import { BaseStepExector } from "../base_executor";
import { StepFunction, Step, StepOutput } from "../../types";

export class FunctionStepExecutor extends BaseStepExector {
    private readonly fn: StepFunction;

    constructor(functionName: string,
        step: Step,
        rootPath: string,
        bindings: Dictionary<any>,
        parentLogger: Logger) {
        super(step, rootPath, bindings, parentLogger.child({ type: "Function" }));
        this.fn = this.prepareFunction(functionName);
    }

    private prepareFunction(functionName: string): StepFunction {
        if (typeof this.bindings[functionName] !== "function") {
            throw new WorkflowExecutionError("Invalid functionName", 400, this.step.name);
        }
        return this.bindings[functionName] as StepFunction;
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        const allBindings = Object.assign({}, this.bindings, executionBindings, this.getLogger());
        return this.fn(input, allBindings);
    }
}