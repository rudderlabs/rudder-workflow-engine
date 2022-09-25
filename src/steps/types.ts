import { Logger } from "pino";
import { Binding, Dictionary, ExecutionBindings } from "../types";

export interface StepExecutor {
    getStepName(): string;
    getStepType(): string;
    getStep(): Step;
    getLogger(): Logger;
    getBindings(): Dictionary<any>;
    execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>
}

export type StatusError = {
    status: number;
    message: string;
};

export type StepOutput = {
    error?: StatusError;
    skipped?: boolean;
    output?: any;
    outputs?: Dictionary<any>;
};

export enum StepType {
    Simple = 'simple',
    Workflow = 'workflow',
}

export enum StepExitAction {
    Return = 'return',
    Continue = 'continue',
}
export type StepFunction = (input: any, bindings: Dictionary<any>) => StepOutput;

export type ExternalWorkflow = {
    path: string;
    // root path for resolving dependencies
    rootPath?: string;
};

export type StepCommon = {
    name: string;
    description?: string;
    type?: StepType;
    condition?: string;
    inputTemplate?: string;
    loopOverInput?: boolean;
    onComplete?: StepExitAction;
    onError?: StepExitAction;
    debug?: boolean;
};

export type SimpleStep = StepCommon & {
    // One of the template, templatePath, externalWorkflowPath, Function are required for simple steps
    template?: string;
    templatePath?: string;
    // external workflow is executed independently and we can access only final output
    externalWorkflow?: ExternalWorkflow;
    // Function must be passed using bindings
    functionName?: string;
};

export type Template = {
    content?: string;
    path?: string
}

export type WorkflowStep = StepCommon & {
    bindings?: Binding[];
    // One of the template, templatePath, Function are required for simple steps
    // One of the steps, workflowStepPath are required for workflow steps
    steps?: SimpleStep[];
    workflowStepPath?: string;
};

export type Step = SimpleStep | WorkflowStep;
