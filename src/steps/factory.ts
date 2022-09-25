import { Logger } from "pino";
import { WorkflowUtils } from "../utils";
import { CustomError } from "../errors";
import {  Dictionary, Step, StepType, WorkflowStep } from "../types";
import { ConditionalStepExecutor } from "./conditional_step";
import { InputTemplateStepExecutor } from "./input_template_step";
import { DebuggableStepExecutor } from "./debuggable_step";
import { LoopStepExecutor } from "./loop_step";
import { StepExecutor } from "./types";
import { WorkflowStepExecutor } from "./workflow_step";
import { SimpleStepExecutorFactory } from "./simple_steps/factory";

export class StepExecutorFactory {   
    private static getStepExecutor(step: Step, rootPath: string, bindings: Dictionary<any>, parentLogger: Logger): StepExecutor {
        switch(WorkflowUtils.getStepType(step)) {
            case StepType.Simple:
                return SimpleStepExecutorFactory.create(step, rootPath, bindings, parentLogger);
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
            stepExecutor = new InputTemplateStepExecutor(step.inputTemplate, stepExecutor);
        }

        if (step.condition) {
            stepExecutor = new ConditionalStepExecutor(step.condition, stepExecutor);
        }

        if (step.debug) {
            stepExecutor = new DebuggableStepExecutor(stepExecutor);
        }
        return stepExecutor;
    }
}