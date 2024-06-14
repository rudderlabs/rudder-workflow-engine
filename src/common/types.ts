import { FlatMappingPaths } from '@rudderstack/json-template-engine';
import { type StepExecutionError } from '../errors';

export interface Executor {
  execute(input: any, bindings?: ExecutionBindings): Promise<any>;
}

export enum LogLevel {
  DEBUG = 0,
  INFO,
  WARN,
  ERROR,
}
export type PathBinding = {
  // exported value's name in bindings
  // if not specified then all paths will be exported
  name?: string | string[];
  // the file from which the export has to be looked at
  // defaults to bindings.js / bindings.ts
  path?: string;
  // Export all when name specified
  exportAll?: true;
};

export type ValueBinding = {
  name: string;
  value: any;
};

export type ParentBinding = {
  name: string;
  fromParent: true;
};

export type Binding = PathBinding | ValueBinding | ParentBinding;
export type ExecutionBindings = {
  [key: string]: any;
  outputs: Record<string, any>;
  context: Record<string, any>;
  setContext: (string, any) => void;
};

export enum TemplateType {
  JSONATA = 'jsonata',
  JSON_TEMPLATE = 'jsontemplate',
}
export type StepOutput = {
  error?: {
    message: string;
    status: number;
    originalError: Error;
    error: StepExecutionError;
  };
  skipped?: boolean;
  output?: any;
  outputs?: Record<string, any>;
};

export type LoopStepOutput = {
  output: StepOutput[];
};

export type BatchResult = {
  key: string;
  items: any[];
  indices: number[];
};

export type BatchStepOutput = {
  output: BatchResult[];
};

export enum StepType {
  Simple = 'simple',
  Workflow = 'workflow',
  Batch = 'batch',
  Custom = 'custom',
  Unknown = 'unknown',
}

export enum StepExitAction {
  Return = 'return',
  Continue = 'continue',
}
export type StepFunction = (input: any, bindings: ExecutionBindings) => StepOutput;

export type ExternalWorkflow = {
  path: string;
  // root path for resolving dependencies
  rootPath?: string;
  bindings?: Binding[];
};

export type StepCommon = {
  name: string;
  description?: string;
  type?: StepType;
  condition?: string;
  else?: Step;
  inputTemplate?: string;
  loopOverInput?: boolean;
  loopCondition?: string;
  onComplete?: StepExitAction;
  onError?: StepExitAction;
  debug?: boolean;
  identity?: boolean;
};

export type SimpleStep = StepCommon & {
  // One of the template, templatePath, externalWorkflowPath, Function are required for simple steps
  template?: string;
  templatePath?: string;
  mappings?: boolean;
  // external workflow is executed independently and we can access only final output
  externalWorkflow?: ExternalWorkflow;
  // Function must be passed using bindings
  functionName?: string;
};

export type BatchConfig = {
  options?: {
    size?: number;
    length?: number;
  };
  disabled?: true;
  filter?: string;
  map?: string;
  key: string;
};

export type BatchStep = StepCommon & {
  batches?: BatchConfig[];
  // Executor must be passed using bindings
  executor?: string;
};

export type CustomStep = StepCommon & {
  // provider must be passed using bindings
  provider?: string;
  // Executor must be passed using bindings
  executor?: string;
  params?: Record<string, any>;
};

export type WorkflowStep = StepCommon & {
  // One of the template, templatePath, Function are required for simple steps
  // One of the steps, workflowStepPath are required for workflow steps
  steps?: SimpleStep[];
  workflowStepPath?: string;
};

export type Step = SimpleStep | WorkflowStep | BatchStep | CustomStep;

export type Workflow = {
  name: string;
  bindings?: Binding[];
  steps: Step[];
  templateType?: TemplateType;
  // Executor name will be searched in the bindings
  executor?: string;
};

export type WorkflowOutput = {
  output?: any;
  outputs?: Record<string, any>;
  status?: number;
  error?: any;
};

export type WorkflowOptions = {
  bindingsPaths?: string[];
  rootPath: string;
  creationTimeBindings?: Record<string, any>;
  templateType?: TemplateType;
  executor?: WorkflowExecutor;
  bindingProvider?: WorkflowBindingProvider;
};

export type WorkflowOptionsInternal = WorkflowOptions & {
  currentBindings: Record<string, any>;
  parentBindings?: Record<string, any>;
};

export interface WorkflowExecutor {
  execute(
    engine: WorkflowEngine,
    input: any,
    bindings?: Record<string, any>,
  ): Promise<WorkflowOutput>;
}

export interface WorkflowBindingProvider {
  provide(name: string): Promise<any>;
}

export interface StepExecutor extends Executor {
  /**
   * Returns the name of the step which executor is operating
   */
  getStepName(): string;
  /**
   * Returns the step which executor is operating
   */
  getStep(): Step;
  /**
   * Executes the step
   */
  execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}

export interface WorkflowEngine extends Executor {
  getName(): string;
  getBindings(): Record<string, any>;
  getStepExecutors(): StepExecutor[];
  getStepExecutor(stepName: string): StepExecutor;
  execute(input: any, executionBindings?: Record<string, any>): Promise<WorkflowOutput>;
}
