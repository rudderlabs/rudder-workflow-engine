import { WorkflowExecutionError } from '../../src';
import { ScenarioError } from '../types';

export class CommonUtils {
  static matchError(actual: WorkflowExecutionError, expected?: ScenarioError) {
    if (expected === undefined) {
      throw actual;
    }

    this.matchErrorMessage(actual, expected);
    this.matchStatus(actual, expected);
    this.matchStepName(actual, expected);
    this.matchChildStepName(actual, expected);
    this.matchWorkflowName(actual, expected);
    this.matchErrorClass(actual, expected);
    this.matchNestedError(actual, expected);
  }

  private static matchErrorMessage(actual: WorkflowExecutionError, expected: ScenarioError) {
    if (expected.message) {
      expect(actual.message).toEqual(expect.stringContaining(expected.message));
    }
  }

  private static matchStatus(actual: WorkflowExecutionError, expected: ScenarioError) {
    if (expected.status) {
      expect(actual.status).toEqual(expected.status);
    }
  }

  private static matchStepName(actual: WorkflowExecutionError, expected: ScenarioError) {
    if (expected.stepName) {
      expect(actual.stepName).toEqual(expected.stepName);
    }
  }

  private static matchChildStepName(actual: WorkflowExecutionError, expected: ScenarioError) {
    if (expected.childStepName) {
      expect(actual.childStepName).toEqual(expected.childStepName);
    }
  }

  private static matchWorkflowName(actual: WorkflowExecutionError, expected: ScenarioError) {
    if (expected.workflowName) {
      expect(actual.workflowName).toEqual(expected.workflowName);
    }
  }

  private static matchErrorClass(actual: WorkflowExecutionError, expected: ScenarioError) {
    if (expected.class) {
      expect(actual.originalError.constructor.name).toEqual(expected.class);
    }
  }

  private static matchNestedError(actual: WorkflowExecutionError, expected: ScenarioError) {
    if (expected.error) {
      this.matchError(actual.error as WorkflowExecutionError, expected.error);
    }
  }
}
