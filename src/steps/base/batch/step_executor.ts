import { BatchStep, BatchStepOutput, ExecutionBindings } from '../../../common/types';
import { BatchUtils } from '../../../common/utils';
import { BatchError, ErrorUtils } from '../../../errors';
import { BatchExecutor } from '../../types';
import { BaseStepExecutor } from '../executors/base';

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
