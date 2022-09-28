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
  error?: {
    message?: string,
    status?: string,
    code?: string
  },
  errorClass?: string,
  logger?: LogCounts;
};
