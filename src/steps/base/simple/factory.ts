import { Logger } from "pino";
import { WorkflowExecutionError } from "../../../errors";
import { Dictionary } from "../../../types";
import { SimpleStep, StepExecutor } from "../../types";
import { BaseStepExector } from "../base_executor";
import { ExternalWorkflowStepExecutor } from "./external_workflow_executor";
import { FunctionStepExecutor } from "./function_exector";
import { TemplateStepExecutor } from "./template_executor";

export class SimpleStepExecutorFactory {
    static create(step: SimpleStep, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger): BaseStepExector {
        const simpleStepLogger = parentLogger.child({ step: step.name });
        if (step.externalWorkflow) {
            return new ExternalWorkflowStepExecutor(step.externalWorkflow,
                step, rootPath, bindings, simpleStepLogger);
        }
        if (step.functionName) {
            return new FunctionStepExecutor(step.functionName,
                step, rootPath, bindings, simpleStepLogger);
        }

        if (step.template || step.templatePath) {
            return new TemplateStepExecutor(
                {
                    content: step.template,
                    path: step.templatePath
                },
                step, rootPath, bindings, simpleStepLogger);
        }

        throw new WorkflowExecutionError("Invalid simple step configuration", 400, step.name);
    }
}