import { BatchUtils } from './batch';

describe('Batch utils', () => {
  describe('chunkArrayBySizeAndLength', () => {
    const array = Array.from('abcdefghijk');
    it('should chunk by length = 2', () => {
      expect(BatchUtils.chunkArrayBySizeAndLength(array, { maxItems: 2 })).toEqual({
        indices: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10]],
        items: [['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j'], ['k']],
      });
    });
    it('should chunk by length = 3', () => {
      expect(BatchUtils.chunkArrayBySizeAndLength(array, { maxItems: 3 })).toEqual({
        items: [
          ['a', 'b', 'c'],
          ['d', 'e', 'f'],
          ['g', 'h', 'i'],
          ['j', 'k'],
        ],
        indices: [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [9, 10],
        ],
      });
    });

    it('should chunk by size = 32', () => {
      expect(BatchUtils.chunkArrayBySizeAndLength(array, { maxSizeInBytes: 32 })).toEqual({
        items: [['a', 'b'], ['c', 'd'], ['e', 'f'], ['g', 'h'], ['i', 'j'], ['k']],
        indices: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9], [10]],
      });
    });
    it('should chunk by size = 48', () => {
      expect(BatchUtils.chunkArrayBySizeAndLength(array, { maxSizeInBytes: 48 })).toEqual({
        items: [
          ['a', 'b', 'c'],
          ['d', 'e', 'f'],
          ['g', 'h', 'i'],
          ['j', 'k'],
        ],
        indices: [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [9, 10],
        ],
      });
    });
    it('should chunk without size and length', () => {
      expect(BatchUtils.chunkArrayBySizeAndLength(array)).toEqual({
        items: [['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']],
        indices: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
      });
    });
    it('should chunk empty array', () => {
      expect(BatchUtils.chunkArrayBySizeAndLength([])).toEqual({
        items: [],
        indices: [],
      });
    });
  });

  describe('validateBatchResults', () => {
    it('should not throw error if batchResults is valid', () => {
      expect(() => {
        BatchUtils.validateBatchResults(
          [1, 2, 3],
          [
            {
              indices: [0, 1, 2],
              items: [1, 2, 3],
              key: 'key',
            },
          ],
        );
      }).not.toThrow();
    });
    it('should throw error if batchResults is not array', () => {
      expect(() => {
        BatchUtils.validateBatchResults([], {} as any);
      }).toThrow();
    });
    it('should throw error if batchResults does not contain all indices', () => {
      expect(() => {
        BatchUtils.validateBatchResults(
          [1, 2, 3],
          [
            {
              indices: [1, 2],
              items: [1, 2],
              key: 'key',
            },
          ],
        );
      }).toThrow();
    });
    it('should throw error if batchResults does not contain same number of items as input', () => {
      expect(() => {
        BatchUtils.validateBatchResults(
          [1, 2, 3],
          [
            {
              indices: [0, 1, 2],
              items: [1, 2],
              key: 'key',
            },
          ],
        );
      }).toThrow();
    });

    it('should throw error if batchResults does not contain same number of indices as input', () => {
      expect(() => {
        BatchUtils.validateBatchResults(
          [1, 2, 3],
          [
            {
              indices: [0, 1],
              items: [1, 2, 3],
              key: 'key',
            },
          ],
        );
      }).toThrow();
    });
    it('should throw error if batchResults does not contain same of number of indices as items', () => {
      expect(() => {
        BatchUtils.validateBatchResults(
          [1, 2, 3],
          [
            {
              indices: [0, 1],
              items: [1],
              key: 'key',
            },
            {
              indices: [3],
              items: [2, 3],
              key: 'key',
            },
          ],
        );
      }).toThrow();
    });
    it('should throw error if batchResults does not valid key', () => {
      expect(() => {
        BatchUtils.validateBatchResults(
          [1, 2, 3],
          [
            {
              indices: [0, 1, 2],
              items: [1, 2, 3],
              key: '',
            },
          ],
        );
      }).toThrow();
    });
  });
});
