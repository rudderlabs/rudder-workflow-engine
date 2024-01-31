import { StepCreationError } from './step_creation';

export class WorkflowCreationError extends StepCreationError {
  workflowName: string;

  constructor(message: string, workflowName: string, stepName?: string, childStepName?: string) {
    super(message, stepName, childStepName);
    this.workflowName = workflowName;
  }
}
