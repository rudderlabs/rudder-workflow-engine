import { ErrorInfo } from './info';
import { StepExecutionError } from './step_execution';

export class WorkflowExecutionError extends StepExecutionError {
  workflowName: string;

  constructor(message: string, status: number, workflowName: string, info?: ErrorInfo) {
    super(message, status, info);
    this.workflowName = workflowName;
  }
}
