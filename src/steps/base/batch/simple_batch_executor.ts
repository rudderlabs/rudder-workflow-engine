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
  readonly filterMapExector?: StepExecutor;
  constructor(config: BatchConfig, filterMapExector?: StepExecutor) {
    this.config = config;
    this.filterMapExector = filterMapExector;
  }
  async execute(input: any[], bindings: ExecutionBindings): Promise<BatchResult[]> {
    const { filteredInput, filteredIndices } = await this.handleFilteringAndMapping(
      input,
      bindings,
    );
    if (this.config.disabled) {
      return this.handleBatchingDisabled(filteredInput, filteredIndices);
    }
    return this.handleBatching(filteredInput, filteredIndices);
  }

  private handleBatching(filteredInput: any[], filteredIndices: number[]): BatchResult[] {
    const { items: itemArrays, indices } = BatchUtils.chunkArrayBySizeAndLength(filteredInput, {
      maxSizeInBytes: this.config.options?.size,
      maxItems: this.config.options?.length,
    });
    return itemArrays.map((items, index) => {
      return {
        items,
        indices: indices[index].map((i) => filteredIndices[i]),
        key: this.config.key,
      };
    });
  }

  private handleBatchingDisabled(filteredInput: any[], filteredIndices: number[]): BatchResult[] {
    return filteredInput.map((item, index) => {
      return {
        items: [item],
        indices: [filteredIndices[index]],
        key: this.config.key,
      };
    });
  }

  private async handleFilteringAndMapping(input: any[], bindings: ExecutionBindings) {
    let filteredInput: any[] = input;
    let filteredIndices: number[] = Array.from(input.keys());

    if (this.filterMapExector) {
      // Filter map executor internally invokes the loop step executor
      const filterResult = (await this.filterMapExector.execute(input, bindings)) as LoopStepOutput;
      filteredIndices = filteredIndices.filter((_, index) => !filterResult.output[index].skipped);
      filteredInput = filteredIndices.map((index) => filterResult.output[index].output);
    }
    return { filteredInput, filteredIndices };
  }
}
