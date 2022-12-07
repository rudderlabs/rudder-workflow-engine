import { ScenarioError } from '../types';

export class CommonUtils {
  static getErrorMatcher(error?: ScenarioError) {
    if (!error) {
      // Ideally shouldn't reach here.
      // Sending default error so that test case fails.
      return { message: 'should fail' };
    }
    let errorMatcher = error;
    if (error.message) {
      errorMatcher.message = expect.stringContaining(error.message);
    }
    return errorMatcher;
  }
}
