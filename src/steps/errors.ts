import { StatusError } from '../common/errors/status';

export class StepCreationError extends StatusError {
  stepName?: string;
  childStepName?: string;
  constructor(message: string, stepName?: string, childStepName?: string) {
    super(message, 400);
    this.stepName = stepName;
    this.childStepName = childStepName;
  }
}

export class StepExecutionError extends StatusError {
  stepName: string;
  childStepName?: string;
  error: Error;
  originalError: Error;
  constructor(
    message: string,
    status: number,
    stepName: string,
    childStepName?: string,
    error?: Error,
  ) {
    super(message, status);
    this.stepName = stepName;
    this.childStepName = childStepName;
    this.error = error || this;
    this.originalError = (this.error as any).originalError || error;
  }
}

export class ReturnResultError extends Error {
  result: any;
  constructor(result: any) {
    super();
    this.result = result;
  }
}
