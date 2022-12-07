import { LogLevel, WorkflowOptions } from '../src';

export type ScenarioError = {
  message?: string;
  status?: string;
  stepName?: string;
  childStepName?: string;
};

export type Scenario = {
  description?: string;
  input?: any;
  workflowPath?: string;
  options?: WorkflowOptions;
  stepName?: string;
  childStepName?: string;
  output?: any;
  error?: ScenarioError;
  errorClass?: string;
  logLevel?: LogLevel;
};
