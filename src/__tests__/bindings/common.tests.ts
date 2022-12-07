import { toMilliseconds, toSeconds, toArray } from '../../bindings';

describe('Common Bindings', () => {
  describe('toMilliseconds', () => {
    it('should return milliseconds of timestamp', () => {
      expect(toMilliseconds('2022-04-26T09:35:24.561Z')).toBe(1650965724561);
    });
    it('should return NaN for invalid timestamp string', () => {
      expect(toMilliseconds('invalid timestamp')).toBeUndefined();
    });
    it('should return undefined for blank timestamp string', () => {
      expect(toMilliseconds('')).toBeUndefined();
    });
  });
  describe('toSeconds', () => {
    it('should return seconds of timestamp', () => {
      expect(toSeconds('2022-04-26T09:35:24.561Z')).toBe(1650965724);
    });
    it('should return NaN for invalid timestamp string', () => {
      expect(toSeconds('invalid timestamp')).toBeUndefined();
    });
    it('should return undefined for blank timestamp string', () => {
      expect(toSeconds('')).toBeUndefined();
    });
  });
  describe('toArray', () => {
    it('should return array if input is array', () => {
      expect(toArray([1, 2])).toEqual([1, 2]);
    });

    it('should return array if input is single value', () => {
      expect(toArray({ a: 1 })).toEqual([{ a: 1 }]);
    });
    it('should return undefined if input is undefined', () => {
      expect(toArray(undefined)).toBeUndefined();
    });
  });
});
