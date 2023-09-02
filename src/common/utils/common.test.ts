import { CommonUtils } from './common';

describe('Common utils', () => {
  describe('findDuplicateStrings', () => {
    it('should return duplicate strings when duplicates are present', () => {
      expect(CommonUtils.findDuplicateStrings(['a', 'b', 'c', 'a', 'c'])).toEqual(['a', 'c']);
    });
    it('should return empty array when no duplicates are present', () => {
      expect(CommonUtils.findDuplicateStrings(['a', 'b', 'c'])).toEqual([]);
    });
    it('should return empty array when empty array is given as input', () => {
      expect(CommonUtils.findDuplicateStrings([])).toEqual([]);
    });
  });
});
