import { ExecutionBindings, Binding } from '../workflow/types';
import { Executor } from '../common/types';
import { JsonataStepExecutor, JsonTemplateStepExecutor } from './base/simple/executors/template';
import { StepExecutionError } from './errors';

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

export enum TemplateType {
  JSONATA = 'jsonata',
  JSON_TEMPLATE = 'jsontemplate',
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
  path?: string;
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

export interface BatchExecutor {
  execute(input: any[], bindings: ExecutionBindings): Promise<BatchResult[]>;
}

export type CustomStep = StepCommon & {
  // provider must be passed using bindings
  provider?: string;
  // Executor must be passed using bindings
  executor?: string;
  params?: Record<string, any>;
};

export interface CustomStepExecutor {
  execute(input: any, bindings: ExecutionBindings, params?: Record<string, any>): Promise<any>;
}
export interface CustomStepExecutorProvider {
  provide(step: CustomStep): Promise<CustomStepExecutor>;
}

export type TemplateStepExecutor = JsonTemplateStepExecutor | JsonataStepExecutor;

export type WorkflowStep = StepCommon & {
  // One of the template, templatePath, Function are required for simple steps
  // One of the steps, workflowStepPath are required for workflow steps
  steps?: SimpleStep[];
  workflowStepPath?: string;
};

export type Step = SimpleStep | WorkflowStep | BatchStep | CustomStep;
