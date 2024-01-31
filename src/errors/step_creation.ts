import { StatusError } from './status';

export class StepCreationError extends StatusError {
  stepName?: string;

  childStepName?: string;

  constructor(message: string, stepName?: string, childStepName?: string) {
    super(message, 400);
    this.stepName = stepName;
    this.childStepName = childStepName;
  }
}
