import sizeof from 'object-sizeof';
import { BatchResult } from '../../steps';
import { BatchError } from '../errors/batch';
export class BatchUtils {
  static chunkArrayBySizeAndLength(
    array: any[],
    options: { maxSizeInBytes?: number; maxItems?: number } = {},
  ): { items: any[][]; indices: number[][] } {
    const items: any[][] = [];
    const indices: number[][] = [];
    if (!array || !array.length) {
      return { items, indices };
    }
    const { maxSizeInBytes, maxItems } = options;
    let currentChunk: any[] = [array[0]];
    let currentIndices: number[] = [0];
    let currentSize = maxSizeInBytes ? sizeof(array[0]) : 0;
    for (let idx = 1; idx < array.length; idx++) {
      const item = array[idx];
      const itemSizeInBytes = maxSizeInBytes ? sizeof(item) : 0;
      if (
        this.isSizeLimitReached(itemSizeInBytes, currentSize, maxSizeInBytes) ||
        this.isLengthLimitReached(currentChunk.length, maxItems)
      ) {
        items.push(currentChunk);
        indices.push(currentIndices);
        currentChunk = [];
        currentIndices = [];
        currentSize = 0;
      }
      currentChunk.push(item);
      currentIndices.push(idx);
      currentSize += itemSizeInBytes;
    }

    if (currentChunk.length > 0) {
      items.push(currentChunk);
      indices.push(currentIndices);
    }

    return { items, indices };
  }

  static validateBatchResults(input: any[], batchResults: BatchResult[]) {
    if (!Array.isArray(batchResults)) {
      throw new BatchError('batch step requires array output from batch executor');
    }
    const batchIndices = batchResults.reduce((acc, batchResult) => {
      return acc.concat(batchResult.indices);
    }, [] as number[]);
    batchIndices.sort().every((index, idx) => {
      if (index !== idx) {
        throw new BatchError('batch step requires return all indices');
      }
    });

    const batchItems = batchResults.reduce((acc, batchResult) => {
      return acc.concat(batchResult.items);
    }, [] as any[]);
    if (batchIndices.length !== input.length || batchItems.length !== input.length) {
      throw new BatchError(
        'batch step requires batch executor to return same number of items as input',
      );
    }
    batchResults.every((batchResult) => {
      if (!batchResult.key) {
        throw new BatchError(
          'batch step requires batch executor to return key for each batch result',
        );
      }
      if (batchResult.indices.length !== batchResult.items.length) {
        throw new BatchError(
          'batch step requires batch executor to return same number of items and indices',
        );
      }
    });
  }

  private static isSizeLimitReached(
    itemSizeInBytes: number,
    currentSize: number,
    maxSizeInBytes?: number,
  ) {
    return maxSizeInBytes && currentSize + itemSizeInBytes > maxSizeInBytes;
  }

  private static isLengthLimitReached(currentLength: number, maxLength?: number) {
    return maxLength && currentLength + 1 > maxLength;
  }
}
