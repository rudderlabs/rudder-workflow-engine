import { StatusError } from '../errors';

export class StepCreationError extends Error {
  stepName?: string;
  constructor(message: string, stepName?: string) {
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
