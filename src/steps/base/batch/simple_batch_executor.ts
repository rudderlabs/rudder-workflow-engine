import { chunk } from 'lodash';
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
    const filteredIndices = Array.from(input.keys());
    const filteredInput = input;
    if (this.filterExector) {
      // Filter executor internally invokes the loop step executor
      const filterResult = (await this.filterExector.execute(input, bindings)) as LoopStepOutput;
      filterResult.output.forEach((value, index) => {
        if (value.skipped) {
          filteredIndices.splice(index, 1);
          filteredInput.splice(index, 1);
        }
      });
    }
    const { items: itemArrays, indices } = BatchUtils.chunkArrayBySizeAndLength(
      filteredInput,
      this.config.size,
      this.config.length,
    );
    return itemArrays.map((items, index) => {
      return {
        items,
        indices: indices[index].map((i) => filteredIndices[i]),
        key: this.config.key,
      };
    });
  }
}
