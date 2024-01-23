/* eslint-disable max-classes-per-file */
import { StatusError } from '../common/errors/status';
import { ErrorInfo } from './types';

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
  stepName?: string;

  childStepName?: string;

  error: Error;

  originalError: Error;

  constructor(message: string, status: number, info?: ErrorInfo) {
    super(message, status);
    this.stepName = info?.stepName;
    this.childStepName = info?.childStepName;
    this.error = info?.error || this;
    this.originalError = (this.error as any).originalError || info?.error;
  }
}

export class ReturnResultError extends Error {
  result: any;

  constructor(result: any) {
    super();
    this.result = result;
  }
}
