import jsonata from 'jsonata';
import { WorkflowEngine } from './workflow';

export type Dictionary<T> = Record<string, T>;

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

export type Binding = {
  // exported value's name in bindings
  // if not specified then all paths will be exported
  name?: string;
  // the file from which the export has to be looked at
  // defaults to bindings.js
  path?: string;
  // Export all when name specified
  exportAll?: true;
};

export type StepCommon = {
  name: string;
  description?: string;
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
  externalWorkflow?: {
    path: string;
    // root path for resolving dependencies
    rootPath?: string;
  };
  // Function must be passed using bindings
  functionName?: string;
};

export type WorkflowStep = StepCommon & {
  bindings?: Binding[];
  // One of the template, templatePath, Function are required for simple steps
  // One of the steps, workflowStepPath are required for workflow steps
  steps?: SimpleStep[];
  workflowStepPath?: string;
};

export type Step = SimpleStep | WorkflowStep;

export type Workflow = {
  name?: string;
  bindings?: Binding[];
  steps: Step[];
};

export type WorkflowOutput = {
  output?: any;
  outputs?: Dictionary<any>;
  status?: number;
  error?: any;
};

export type StepInternalCommon = {
  name: string;
  // This is workflow's rootPath(provided during initialisation of "WorkflowEngine")
  rootPath: string;
  description?: string;
  conditionExpression?: jsonata.Expression;
  inputTemplateExpression?: jsonata.Expression;
  loopOverInput?: boolean;
  onComplete?: StepExitAction;
  onError?: StepExitAction;
  debug?: boolean;

  init(step: Step, bindings?: Record<string, any>): void;
  execute(input: any, bindings: Dictionary<any>): Promise<StepOutput>;
  validate(): void;
};

export type SimpleStepInternal = StepInternalCommon & {
  type: StepType.Simple;
  parent?: WorkflowStepInternal;
  templateExpression?: jsonata.Expression;
  externalWorkflowEngine?: WorkflowEngine;
  function?: StepFunction;
};

export type WorkflowStepInternal = StepInternalCommon & {
  type: StepType.Workflow;
  bindings?: Dictionary<any>;
  steps?: SimpleStepInternal[];
};

export type StepInternal = SimpleStepInternal | WorkflowStepInternal;

export type WorkflowInternal = {
  name?: string;
  bindings?: Dictionary<any>;
  steps: StepInternal[];
};
