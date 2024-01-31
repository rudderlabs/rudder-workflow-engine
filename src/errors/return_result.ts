/* eslint-disable max-classes-per-file */

export class ReturnResultError extends Error {
  result: any;

  constructor(result: any) {
    super();
    this.result = result;
  }
}
