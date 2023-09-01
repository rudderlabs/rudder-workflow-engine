import { ExecutionBindings } from '../../../workflow';
import { BatchExecutor, BatchResult } from '../../../steps/types';

export class DefaultBatchWorkflowExecutor implements BatchExecutor {
  readonly executors: BatchExecutor[];
  constructor(executors: BatchExecutor[]) {
    this.executors = executors;
  }
  async execute(input: any[], bindings: ExecutionBindings): Promise<BatchResult[]> {
    const result: BatchResult[][] = await Promise.all(
      this.executors.map((executor) => executor.execute(input, bindings)),
    );
    return result.flat();
  }
}
