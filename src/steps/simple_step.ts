import { readFileSync } from "fs";
import jsonata from "jsonata";
import { join } from "path";
import { Logger } from "pino";
import { CustomError } from "../errors";
import {
    Dictionary, ExecutionBindings, SimpleStep,
    StepFunction, StepOutput, Workflow
} from "../types";
import { WorkflowUtils } from "../utils";
import { WorkflowEngine } from "../workflow";
import { BaseExector } from "./base_step";

export class SimpleStepExecutor extends BaseExector {
    private readonly templateExpression?: jsonata.Expression;
    private readonly function?: StepFunction;
    private readonly externalWorkflowEngine?: WorkflowEngine;

    constructor(step: SimpleStep,
        rootPath: string,
        bindings: Dictionary<any>,
        parentLogger: Logger) {
        super(step, rootPath, bindings,
            parentLogger.child({ simple_step: step.name }));
        this.templateExpression = this.prepareTemplateExpression();
        this.function = this.prepareFunction();
        this.externalWorkflowEngine = this.prepareExternalWorkflowEngine();
    }

    private prepareExternalWorkflowEngine(): WorkflowEngine | undefined {
        const step = this.step as SimpleStep;
        if (step.externalWorkflow) {
            const workflowPath = join(this.rootPath, step.externalWorkflow.path);
            const workflow = WorkflowUtils.createFromFilePath<Workflow>(workflowPath);
            const externalWorkflowRootPath = join(this.rootPath, step.externalWorkflow.rootPath || '');
            return new WorkflowEngine(workflow, externalWorkflowRootPath);
        }
    }

    private prepareFunction(): StepFunction | undefined {
        const step = this.step as SimpleStep;
        if (step.functionName) {
            if (typeof this.bindings[step.functionName] !== "function") {
                throw new CustomError("Invalid functionName", 400, step.name);
            }
            return this.bindings[step.functionName] as StepFunction;
        }
    }

    private prepareTemplateExpression(): jsonata.Expression | undefined {
        const step = this.step as SimpleStep;
        if (step.templatePath) {
            const templatePath = join(this.rootPath, step.templatePath);
            step.template = readFileSync(templatePath, { encoding: "utf-8" })
        }
        if (step.template) {
            return jsonata(step.template);
        }
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        const allBindings = Object.assign({}, this.bindings, executionBindings, {log: this.logger.info} );

        if (this.externalWorkflowEngine) {
            return this.externalWorkflowEngine.execute(input, { context: executionBindings.context });
        }

        if (this.function) {
            return this.function(input, allBindings);
        }

        if (this.templateExpression) {
            const tempExprOut = await WorkflowUtils.jsonataPromise(
                this.templateExpression,
                input,
                allBindings,
            );
            return {
                output: tempExprOut,
            };
        }
        throw new CustomError('Invalid simple step configuration', 400, this.step.name);
    }
}