export type LogCounts = {
  debug?: number;
  info?: number;
  warn?: number;
  error?: number;
};

export type Sceanario = {
  input?: any;
  workflowPath?: string;
  bindingsPaths?: string[];
  output?: any;
  error?: string;
  status?: number;
  logger?: LogCounts;
};
