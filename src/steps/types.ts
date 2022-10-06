import { Logger } from 'pino';
import { ExecutionBindings, Binding } from '../workflow/types';
import { Dictionary, Executor } from '../common/types';
import { BaseStepExecutor } from './base';
import { StatusError } from './errors';

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
   * Returns the logger
   */
  getLogger(): Logger;
  /**
   * Returns the step's static bindings
   */
  getBindings(): Dictionary<any>;

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
  error?: StatusError;
  skipped?: boolean;
  output?: any;
  outputs?: Dictionary<any>;
};

export enum StepType {
  Simple = 'simple',
  Workflow = 'workflow',
  Unknown = 'unknow',
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
  bindingPaths?: string[];
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
  path?: string;
};

export type WorkflowStep = StepCommon & {
  bindings?: Binding[];
  // One of the template, templatePath, Function are required for simple steps
  // One of the steps, workflowStepPath are required for workflow steps
  steps?: SimpleStep[];
  workflowStepPath?: string;
};

export type Step = SimpleStep | WorkflowStep;
