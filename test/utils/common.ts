import { ScenarioError } from '../types';

export class CommonUtils {
  static matchError(actual: any, expected?: ScenarioError) {
    if (!expected) {
      // Ideally shouldn't reach here.
      // Sending default error so that test case fails.
      return { message: 'should fail' };
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
  }
}
