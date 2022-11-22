import { Dictionary, WorkflowOptions } from '../src';

export type LogCounts = {
  debug?: number;
  info?: number;
  warn?: number;
  error?: number;
};

export type FakeLogger = {
  debug: jest.Mock<any, any>;
  info: jest.Mock<any, any>;
  warn: jest.Mock<any, any>;
  error: jest.Mock<any, any>;
  level: string;
  child: () => FakeLogger;
};

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
  bindings?: Dictionary<any>;
  stepName?: string;
  childStepName?: string;
  output?: any;
  error?: ScenarioError;
  errorClass?: string;
  logger?: LogCounts;
};
