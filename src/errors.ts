export class WorkflowEngineError extends Error {
  status: number;
  stepName?: string;
  constructor(message: string, status: number, stepName?: string) {
    super(message);
    this.status = +status;
    this.stepName = stepName;
  }
}

export class ReturnResultError extends Error {
  result: any;
  constructor(result: any) {
    super();
    this.result = result;
  }
}
