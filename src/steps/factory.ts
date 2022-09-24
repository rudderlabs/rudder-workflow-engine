import { Logger } from "pino";
import { WorkflowUtils } from "../utils";
import { CustomError } from "../errors";
import {  Dictionary, SimpleStep, Step, StepType, WorkflowStep } from "../types";
import { ConditionalStepExecutor } from "./conditional_step";
import { CustomInputStepExecutor } from "./custom_input_step";
import { DebuggableStepExecutor } from "./debuggable_step";
import { LoopStepExecutor } from "./loop_step";
import { SimpleStepExecutor } from "./simple_step";
import { StepExecutor } from "./interface";
import { WorkflowStepExecutor } from "./workflow_step";

export class StepExecutorFactory {   
    private static getStepExecutor(step: Step, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger): StepExecutor {
        switch(WorkflowUtils.getStepType(step)) {
            case StepType.Simple:
                return new SimpleStepExecutor(step as SimpleStep, rootPath, bindings, parentLogger);
            case StepType.Workflow:
                return new WorkflowStepExecutor(step as WorkflowStep, rootPath, bindings, parentLogger);
            default:
                throw new CustomError("Invalid step type", 400, step.name);
        }
    } 

    static create(step: Step, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger): StepExecutor {
        let stepExecutor = StepExecutorFactory.getStepExecutor(step, rootPath, bindings, parentLogger);
        
        if (step.loopOverInput) {
            stepExecutor = new LoopStepExecutor(stepExecutor);
        }

        if (step.inputTemplate) {
            stepExecutor = new CustomInputStepExecutor(stepExecutor);
        }

        if (step.condition) {
            stepExecutor = new ConditionalStepExecutor(stepExecutor);
        }

        if (step.debug) {
            stepExecutor = new DebuggableStepExecutor(stepExecutor);
        }
        return stepExecutor;
    }
}