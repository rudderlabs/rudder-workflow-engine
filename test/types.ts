export type LogCounts = {
  debug?: number;
  info?: number;
  warn?: number;
  error?: number;
};

export type SceanarioError = {
  message?: string;
  status?: string;
};

export type Sceanario = {
  input?: any;
  workflowPath?: string;
  bindingsPaths?: string[];
  output?: any;
  error?: SceanarioError;
  errorClass?: string;
  logger?: LogCounts;
};
