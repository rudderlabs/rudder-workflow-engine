import { StepOutput } from '../../../src';

export const add = (input: { a: number; b: number }, bindings: Record<string, any>): StepOutput => {
  const { a, b } = input;
  return {
    output: a + b,
  };
};
