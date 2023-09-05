import { BatchExecutor, BatchStep, BatchStepOutput } from '../../../steps/types';
import { BaseStepExecutor } from '../executors/base';
import { ExecutionBindings } from '../../../workflow';
import { ErrorUtils, BatchUtils } from '../../../common/utils';
import { BatchError } from '../../../common/errors';

export class BatchStepExecutor extends BaseStepExecutor {
  readonly executor: BatchExecutor;
  async execute(input: any, bindings: ExecutionBindings): Promise<BatchStepOutput> {
    try {
      if (!Array.isArray(input)) {
        throw new BatchError('batch step requires array input');
      }
      const batchResults = await this.executor.execute(input, bindings);
      BatchUtils.validateBatchResults(input, batchResults);
      return {
        output: batchResults,
      };
    } catch (e: any) {
      throw ErrorUtils.createStepExecutionError(e, this.getStepName());
    }
  }

  constructor(step: BatchStep, executor: BatchExecutor) {
    super(step);
    this.executor = executor;
  }
}
