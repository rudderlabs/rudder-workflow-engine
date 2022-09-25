import jsonata from "jsonata";
import { WorkflowUtils } from "../utils";
import { ExecutionBindings, StepOutput } from "../types";
import { DecoratableStepExecutor } from "./decoratable_step";
import { StepExecutor } from "./types";

export class InputTemplateStepExecutor extends DecoratableStepExecutor {
    private readonly inputTemplateExpression: jsonata.Expression

    constructor(inputTemplate: string, nextExecutor: StepExecutor) {
        super(nextExecutor);
        this.inputTemplateExpression = jsonata(inputTemplate);
    }

    private async prepareInput(input: any, executionBindings: ExecutionBindings): Promise<any> {
        const allBindings = Object.assign({}, super.getBindings(), executionBindings);
        return WorkflowUtils.jsonataPromise(this.inputTemplateExpression, input, allBindings)
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        const customInput = await this.prepareInput(input, executionBindings);
        return super.execute(customInput, executionBindings);
    }
}