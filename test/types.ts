export type LogCounts = {
  debug?: number;
  info?: number;
  warn?: number;
  error?: number;
};

export type SceanarioError = {
  message?: string;
  status?: string;
  stepName?: string;
  childStepName?: string;
};

export type Sceanario = {
  input?: any;
  workflowPath?: string;
  bindingsPaths?: string[];
  stepName?: string;
  childStepName?: string;
  output?: any;
  error?: SceanarioError;
  errorClass?: string;
  logger?: LogCounts;
};
