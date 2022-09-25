import { Logger } from "pino";
import { CustomError } from "../../errors";
import { Dictionary } from "../../types";
import { SimpleStep, StepExecutor } from "../types";
import { ExternalWorkflowStepExecutor } from "./external_workflow";
import { FunctionStepExecutor } from "./function";
import { TemplateStepExecutor } from "./template";

export class SimpleStepExecutorFactory {
    static create(step: SimpleStep, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger): StepExecutor {
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

        throw new CustomError("Invalid simple step configuration", 400, step.name);
    }
}