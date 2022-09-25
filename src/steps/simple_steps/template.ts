import { readFileSync } from "fs";
import jsonata from "jsonata";
import { join } from "path";
import { Logger } from "pino";
import { WorkflowUtils } from "../../utils";
import { Dictionary, ExecutionBindings, Step, StepOutput } from "../../types";
import { BaseStepExector } from "../base_step";
import { Template } from "../types";

export class TemplateStepExecutor extends BaseStepExector {
    private readonly templateExpression: jsonata.Expression

    constructor(template: Template,
        step: Step,
        rootPath: string,
        bindings: Dictionary<any>,
        parentLogger: Logger) {
        super(step, rootPath, bindings, parentLogger.child({ type: "Template" }));
        this.templateExpression = this.prepareTemplateExpression(template);
    }

    private prepareTemplateExpression(template: Template): jsonata.Expression {
        if (template.path) {
            const templatePath = join(this.rootPath, template.path);
            template.content = readFileSync(templatePath, { encoding: "utf-8" })
        }
        return jsonata(template.content || "");
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        const allBindings = Object.assign({}, this.bindings, executionBindings, this.getLogger());
        const output = await WorkflowUtils.jsonataPromise(this.templateExpression, input, allBindings);
        return { output }
    }
}