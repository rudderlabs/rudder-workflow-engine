import { Logger } from "pino";
import { WorkflowExecutionError } from "../../errors";
import { Dictionary } from "../../types";
import { WorkflowUtils } from "../../utils";
import { Step, StepType, WorkflowStep } from "../types";
import { BaseStepExector } from "./base_executor";
import { SimpleStepExecutorFactory } from "./simple";
import { WorkflowStepExecutor } from "./workflow_step";

export class BaseStepExectorFactory {
    static create(step: Step, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger): BaseStepExector {
        switch (step.type || WorkflowUtils.getStepType(step)) {
            case StepType.Simple:
                return SimpleStepExecutorFactory.create(step, rootPath, bindings, parentLogger);
            case StepType.Workflow:
                return new WorkflowStepExecutor(step as WorkflowStep, rootPath, bindings, parentLogger);
            default:
                throw new WorkflowExecutionError("Invalid step type", 400, step.name);
        }
    }
}