import { ErrorInfo } from './info';
import { StatusError } from './status';

export class StepExecutionError extends StatusError {
  stepName?: string;

  childStepName?: string;

  error: Error;

  originalError: Error;

  constructor(message: string, status: number, info?: ErrorInfo) {
    super(message, status);
    this.stepName = info?.stepName;
    this.childStepName = info?.childStepName;
    this.error = info?.error ?? this;
    this.originalError = (this.error as any).originalError ?? info?.error;
  }
}
