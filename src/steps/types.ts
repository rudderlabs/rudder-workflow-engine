import { ExecutionBindings, Binding } from '../workflow/types';
import { Executor } from '../common/types';
import { BaseStepExecutor } from './base';
import { JsonataStepExecutor, JsonTemplateStepExecutor } from './base/simple/executors/template';

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
   * Return the base step executor
   */
  getBaseExecutor(): BaseStepExecutor;
  /**
   * Executes the step
   */
  execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput>;
}

export type StepOutput = {
  error?: {
    message: string;
    status: number;
    originalError?: Error;
  };
  skipped?: boolean;
  output?: any;
  outputs?: Record<string, any>;
};

export enum StepType {
  Simple = 'simple',
  Workflow = 'workflow',
  Unknown = 'unknow',
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

export type TemplateStepExecutor = JsonTemplateStepExecutor | JsonataStepExecutor;

export type WorkflowStep = StepCommon & {
  // One of the template, templatePath, Function are required for simple steps
  // One of the steps, workflowStepPath are required for workflow steps
  steps?: SimpleStep[];
  workflowStepPath?: string;
};

export type Step = SimpleStep | WorkflowStep;
