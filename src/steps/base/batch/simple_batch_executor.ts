import {
  BatchConfig,
  BatchExecutor,
  BatchResult,
  LoopStepOutput,
  StepExecutor,
} from '../../../steps/types';
import { ExecutionBindings } from '../../../workflow';
import { BatchUtils } from '../../../common/utils/batch';

export class SimpleBatchExecutor implements BatchExecutor {
  readonly config: BatchConfig;
  readonly filterExector?: StepExecutor;
  constructor(config: BatchConfig, filterExector?: StepExecutor) {
    this.config = config;
    this.filterExector = filterExector;
  }
  async execute(input: any[], bindings: ExecutionBindings): Promise<BatchResult[]> {
    let filteredIndices: number[] = input;
    let filteredInput: any[] = Array.from(input.keys());
    if (this.filterExector) {
      // Filter executor internally invokes the loop step executor
      const filterResult = (await this.filterExector.execute(input, bindings)) as LoopStepOutput;
      filteredInput = filteredInput.filter((_, index) => filterResult.output[index].output);
      filteredIndices = filteredIndices.filter((_, index) => filterResult.output[index].output);
    }
    const { items: itemArrays, indices } = BatchUtils.chunkArrayBySizeAndLength(filteredInput, {
      maxSizeInBytes: this.config.size,
      maxItems: this.config.length,
    });
    return itemArrays.map((items, index) => {
      return {
        items,
        indices: indices[index].map((i) => filteredIndices[i]),
        key: this.config.key,
      };
    });
  }
}
