export class BindingNotFoundError extends Error {
  constructor(bindingName: string) {
    super(`Binding not found: ${bindingName}`);
  }
}
