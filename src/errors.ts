export class StatusError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = +status;
  }
}
export class StepCreationError extends Error {
  stepName: string;
  constructor(message: string, stepName: string) {
    super(message);
    this.stepName = stepName;
  }
}

export class StepExecutionError extends StatusError {
  stepName: string;
  constructor(message: string, status: number, stepName: string) {
    super(message, status);
    this.stepName = stepName;
  }
}
export class WorkflowCreationError extends StatusError {
  workflowName: string;
  stepName?: string;
  constructor(message: string, workflowName: string, stepName?: string) {
    super(message, 400);
    this.workflowName = workflowName;
    this.stepName = stepName;
  }
}

export class WorkflowExecutionError extends StatusError {
  workflowName: string;
  stepName?: string;
  error?: Error;
  constructor(
    message: string,
    status: number,
    workflowName: string,
    stepName: string,
    error?: Error,
  ) {
    super(message, status);
    this.workflowName = workflowName;
    this.stepName = stepName;
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
