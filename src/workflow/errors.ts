// eslint-disable-next-line max-classes-per-file
import { ErrorInfo } from '../steps';
import { StepCreationError, StepExecutionError } from '../steps/errors';

export class WorkflowCreationError extends StepCreationError {
  workflowName: string;

  constructor(message: string, workflowName: string, stepName?: string, childStepName?: string) {
    super(message, stepName, childStepName);
    this.workflowName = workflowName;
  }
}

export class WorkflowExecutionError extends StepExecutionError {
  workflowName: string;

  constructor(message: string, status: number, workflowName: string, info?: ErrorInfo) {
    super(message, status, info);
    this.workflowName = workflowName;
  }
}

export class BindingNotFoundError extends Error {
  constructor(bindingName: string) {
    super(`Binding not found: ${bindingName}`);
  }
}
