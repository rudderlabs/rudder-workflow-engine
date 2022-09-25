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

export type ExternalWorkflow = {
  path: string;
  // root path for resolving dependencies
  rootPath?: string;
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
  externalWorkflow?: ExternalWorkflow;
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

export type ExecutionBindings = {
  outputs: Dictionary<any>;
  context: Dictionary<any>;
  setContext: (string, any) => void;
}