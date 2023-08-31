import { LogLevel, WorkflowOptions } from '../src';

export type ScenarioError = {
  message?: string;
  status?: string;
  stepName?: string;
  childStepName?: string;
  errorClass?: string;
};

export type Scenario = {
  description?: string;
  input?: any;
  workflowPath?: string;
  options?: WorkflowOptions;
  stepName?: string;
  output?: any;
  error?: ScenarioError;
  logLevel?: LogLevel;
};
