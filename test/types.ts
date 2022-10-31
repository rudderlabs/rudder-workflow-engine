import { Dictionary } from '../src';

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

export type SceanarioError = {
  message?: string;
  status?: string;
  stepName?: string;
  childStepName?: string;
};

export type Sceanario = {
  description?: string;
  input?: any;
  workflowPath?: string;
  bindingsPaths?: string[];
  bindings?: Dictionary<any>;
  stepName?: string;
  childStepName?: string;
  output?: any;
  error?: SceanarioError;
  errorClass?: string;
  logger?: LogCounts;
};
