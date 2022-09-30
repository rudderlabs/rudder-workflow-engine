import { Dictionary, StepOutput } from '../../../src';

export function logSomething(input: any, bindings: Dictionary<any>): StepOutput {
  bindings[input.level || 'info']('function log', { hello: 'world' });
  return {};
}
