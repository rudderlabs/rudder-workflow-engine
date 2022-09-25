import cloneDeep from "lodash/cloneDeep";
import { Logger } from "pino";
import { getLogger } from "./logger";
import { StepExecutorFactory } from "./steps/factory";
import { StepExecutor } from "./steps/types";
import { Dictionary, ExecutionBindings, StepExitAction, Workflow, WorkflowOutput } from "./types";
import { WorkflowUtils } from "./utils";
import * as libraryBindings from "./bindings"
import { CustomError } from "./errors";

export class WorkflowEngine {
    private readonly steps: StepExecutor[];
    readonly logger: Logger;
    readonly bindings: Dictionary<any>;
    constructor(workflow: Workflow, rootPath: string, ...bindingsPaths: string[]) {
        WorkflowUtils.validateWorkflow(workflow);
        this.logger = getLogger(workflow?.name || 'Workflow');
        this.bindings = this.prepareBindings(
            WorkflowUtils.extractBindings(rootPath, workflow.bindings),
            bindingsPaths);
        this.steps = workflow.steps.map(step =>
            StepExecutorFactory.create(step, rootPath, this.bindings, this.logger))
    }

    private prepareBindings(workflowBindings: Dictionary<any>, bindingsPaths: string[]) {
        return Object.assign({},
            libraryBindings,
            ...bindingsPaths.map(require),
            workflowBindings
        );
    }

    async execute(input: any, context: Record<string, any> = {}): Promise<WorkflowOutput> {
        const newContext = cloneDeep(context);
        const executionBindings: ExecutionBindings = {
            outputs: {},
            context: newContext,
            setContext: (key, value) => {
                newContext[key] = value;
            }
        }

        let finalOutput: any;
        for (const stepExecutor of this.steps) {
            const step = stepExecutor.getStep();
            try {
                const { skipped, output } = await stepExecutor.execute(input, executionBindings);
                if (skipped) {
                    continue;
                }
                executionBindings.outputs[step.name] = output;
                finalOutput = output;
                if (step.onComplete === StepExitAction.Return) {
                    break;
                }
            } catch (error) {
                if (step.onError === StepExitAction.Continue) {
                    this.logger.error(`step: ${step.name} failed`, error);
                    continue;
                }
                this.handleError(error, step.name);
            }
        }

        return { output: finalOutput, outputs: executionBindings.outputs };
    }

    handleError(error: any, stepName: string) {
        const status = WorkflowUtils.isAssertError(error)
            ? 400
            : error.response?.status || error.status || 500;
        throw new CustomError(error.message, status, stepName);
    }
}