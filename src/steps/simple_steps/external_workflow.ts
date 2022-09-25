import { WorkflowUtils } from "../../utils";
import { WorkflowEngine } from "../../workflow";
import {Dictionary, ExecutionBindings, Workflow} from "../../types";
import { join } from "path";
import { BaseStepExector } from "../base_step";
import { Logger } from "pino";
import { ExternalWorkflow, Step, StepOutput } from "../types";

export class ExternalWorkflowStepExecutor extends BaseStepExector {
    private readonly workflowEngine: WorkflowEngine;

    constructor(externalWorkflow: ExternalWorkflow,
        step: Step,
        rootPath: string,
        bindings: Dictionary<any>,
        parentLogger: Logger) {
        super(step, rootPath, bindings, parentLogger.child({ type: "ExternalWorkflow" }));
        this.workflowEngine = this.prepareExternalWorkflowEngine(externalWorkflow);
    }

    private prepareExternalWorkflowEngine(externalWorkflow: ExternalWorkflow): WorkflowEngine {
        const workflowPath = join(this.rootPath, externalWorkflow.path);
        const workflow = WorkflowUtils.createFromFilePath<Workflow>(workflowPath);
        const externalWorkflowRootPath = join(this.rootPath, externalWorkflow.rootPath || '');
        return new WorkflowEngine(workflow, externalWorkflowRootPath);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        return this.workflowEngine.execute(input, executionBindings.context);
    }
}