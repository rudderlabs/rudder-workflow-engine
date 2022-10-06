import { StepCreationError, StepExecutionError } from "../steps/errors";

export class WorkflowCreationError extends StepCreationError {
  workflowName: string;
  constructor(message: string, workflowName: string, stepName?: string, childStepName?: string) {
    super(message, stepName, childStepName);
    this.workflowName = workflowName;
  }
}

export class WorkflowExecutionError extends StepExecutionError {
  workflowName: string;
  constructor(
    message: string,
    status: number,
    workflowName: string,
    stepName: string,
    childStepName?: string,
    error?: Error,
  ) {
    super(message, status, stepName, childStepName, error);
    this.workflowName = workflowName;
  }
}