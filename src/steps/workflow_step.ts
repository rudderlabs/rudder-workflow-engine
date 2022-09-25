import { join } from "path";
import { Logger } from "pino";
import { CustomError } from "../errors";
import { Dictionary, ExecutionBindings, StepOutput, WorkflowStep } from "../types";
import { WorkflowUtils } from "../utils";
import { BaseStepExector } from "./base_step";
import { StepExecutorFactory } from "./factory";
import { StepExecutor } from "./types";

export class WorkflowStepExecutor extends BaseStepExector {
    private readonly steps: StepExecutor[]
    constructor(step: WorkflowStep,
        rootPath: string,
        workflowBindings: Dictionary<any>,
        parentLogger: Logger) {
        const newStep = WorkflowStepExecutor.populate(step, rootPath);
        const bindings = Object.assign({}, workflowBindings,
            WorkflowUtils.extractBindings(rootPath, newStep.bindings));
        super(newStep, rootPath, bindings,
            parentLogger.child({ workflow: step.name }));
        this.steps = this.prepareSteps();
    }

    private static populate(step: WorkflowStep, rootPath: string): WorkflowStep {
        let newStep = step;
        if (step.workflowStepPath) {
            const workflowStepPath = join(rootPath, step.workflowStepPath);
            const workflowStepFromPath = WorkflowUtils.createFromFilePath<WorkflowStep>(workflowStepPath);
            newStep = Object.assign({}, workflowStepFromPath, step);
        }
        if (!newStep.steps?.length) {
            throw new CustomError("Invalid workflow step configuration", 400, step.name);
        }
        return newStep;
    }

    private prepareSteps(): StepExecutor[] {
        const steps = (this.step as WorkflowStep).steps || [];
        return steps.map(step =>
            StepExecutorFactory.create(step, this.rootPath, this.bindings, this.logger)
        );
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        executionBindings.outputs[this.getStepName()] = {};
        let finalOutput: any;
        for (const simpleStepExecutor of this.steps) {
            const { skipped, output } = await simpleStepExecutor.execute(input, executionBindings);
            if (!skipped) {
                executionBindings.outputs[this.getStepName()][simpleStepExecutor.getStepName()] = output;
                finalOutput = output;
            }
        }
        return { outputs: executionBindings.outputs[this.step.name], output: finalOutput };
    }
}