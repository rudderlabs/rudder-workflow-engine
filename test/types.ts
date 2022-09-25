export type Sceanario = {
  input?: any;
  workflowPath?: string;
  output?: any;
  error?: string;
  status?: number;
  logger?: {
    // expected minimum count
    debug?: number;
    info?: number;
    warn?: number;
    error?: number;
  };
};
