import sizeof from 'object-sizeof';
export class BatchUtils {
  static chunkArrayBySizeAndLength(array: any[], maxSizeInBytes?: number, maxItems?: number) {
    const items: any[][] = [];
    const indices: number[][] = [];
    let currentChunk: any[] = [];
    let currentIndices: number[] = [];
    let currentSize = 0;

    for (const [idx, item] of array.entries()) {
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
