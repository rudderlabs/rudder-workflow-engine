import { WorkflowExecutionError } from '../../src';
import { ScenarioError } from '../types';

export class CommonUtils {
  static matchError(actual: WorkflowExecutionError, expected?: ScenarioError) {
    if (expected === undefined) {
      throw actual;
    }
    if (expected.message) {
      expect(actual.message).toEqual(expect.stringContaining(expected.message));
    }
    if (expected.status) {
      expect(actual.status).toEqual(expected.status);
    }
    if (expected.stepName) {
      expect(actual.stepName).toEqual(expected.stepName);
    }
    if (expected.childStepName) {
      expect(actual.childStepName).toEqual(expected.childStepName);
    }
    if (expected.workflowName) {
      expect(actual.workflowName).toEqual(expected.workflowName);
    }

    if (expected.class) {
      expect(actual.originalError.constructor.name).toEqual(expected.class);
    }

    if (expected.error) {
      this.matchError(actual.error as WorkflowExecutionError, expected.error);
    }
  }
}
