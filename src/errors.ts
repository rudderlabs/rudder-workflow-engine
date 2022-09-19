export class CustomError extends Error {
  response: { status: number; stepName: string };
  constructor(message: string, status: number, stepName: string) {
    super(message);
    this.response = { status, stepName };
  }
}

export class ReturnResultError extends Error {
  result: any;
  constructor(result: any) {
    super();
    this.result = result;
  }
}
