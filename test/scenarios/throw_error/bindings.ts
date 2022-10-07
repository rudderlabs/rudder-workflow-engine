export function badFunction(input: any) {
  throw new BadFunctionError(input.error, input.status);
}

class BadFunctionError extends Error {
  response: { status?: number };
  constructor(message: string, status?: number) {
    super(message);
    this.response = { status };
  }
}
