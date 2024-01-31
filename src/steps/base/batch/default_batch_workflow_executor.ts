import { BatchResult, ExecutionBindings } from '../../../common/types';
import { BatchExecutor } from '../../types';

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
