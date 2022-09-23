import { Dictionary, StepInternal, StepOutput } from 'src/types';

export interface StepExecutor {
  validate();
  excute(input: any, bindings: Dictionary<any>): StepOutput;
  init();
  // TODO: Not sure if we need something
  get?(): StepInternal;
}
