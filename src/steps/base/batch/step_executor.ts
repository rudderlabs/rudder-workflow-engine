import { BatchExecutor, BatchStep, BatchStepOutput } from '../../../steps/types';
import { BaseStepExecutor } from '../executors/base';
import { ExecutionBindings } from '../../../workflow';
import { StepExecutionError } from '../../../steps/errors';

export class BatchStepExecutor extends BaseStepExecutor {
  readonly executor: BatchExecutor;
  async execute(input: any, bindings: ExecutionBindings): Promise<BatchStepOutput> {
    if (!Array.isArray(input)) {
      throw new StepExecutionError('batch step requires array input', 400, this.getStepName());
    }
    const batchResults = await this.executor.execute(input, bindings);
    //TODO: validate batchResults
    return {
      output: batchResults,
    };
  }

  constructor(step: BatchStep, executor: BatchExecutor) {
    super(step);
    this.executor = executor;
  }
}
