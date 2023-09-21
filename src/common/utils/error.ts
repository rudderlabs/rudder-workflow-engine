import { WorkflowExecutionError } from '../../workflow';
import { StepExecutionError } from '../../steps';

export class ErrorUtils {
  static isAssertError(error: any) {
    return error.token === 'assert';
  }

  static getErrorStatus(error: any) {
    return error?.response?.status || error?.status || 500;
  }

  static createStepExecutionError(
    error: Error,
    stepName: string,
    childStepName?: string,
  ): StepExecutionError {
    return new StepExecutionError(
      error.message,
      ErrorUtils.getErrorStatus(error),
      stepName,
      childStepName,
      error,
    );
  }

  static createWorkflowExecutionError(error: Error, workflowName: string): WorkflowExecutionError {
    if (error instanceof StepExecutionError) {
      return new WorkflowExecutionError(
        error.message,
        ErrorUtils.getErrorStatus(error),
        workflowName,
        error.stepName,
        error.childStepName,
        error.error,
      );
    }

    return new WorkflowExecutionError(
      error.message,
      ErrorUtils.getErrorStatus(error),
      workflowName,
      undefined,
      undefined,
      error,
    );
  }
}
