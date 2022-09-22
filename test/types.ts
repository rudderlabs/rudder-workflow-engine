export type Sceanario = {
  input?: any;
  workflowPath?: string;
  output?: any;
  error?: string;
  logger?: {
    // expected minimum count
    debug?: number;
    warn?: number;
    error?: number;
  };
};
