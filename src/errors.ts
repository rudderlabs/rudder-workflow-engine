export class StatusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = +status;
  }
}

export class WorkflowEngineError extends StatusError {
  stepName?: string;
  constructor(message: string, status: number, stepName?: string) {
    super(message, status);
    this.stepName = stepName;
  }
}

export class WorkflowExecutionError extends WorkflowEngineError {
  error?: Error;
  constructor(message: string, status: number, stepName: string, error?: Error) {
    super(message, status, stepName);
    this.error = error;
  }
}
export class ReturnResultError extends Error {
  result: any;
  constructor(result: any) {
    super();
    this.result = result;
  }
}
