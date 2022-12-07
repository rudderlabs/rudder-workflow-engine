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
}
