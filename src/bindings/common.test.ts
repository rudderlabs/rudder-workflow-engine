import { toMilliseconds, toSeconds, toArray, SHA256, containsAll } from './common';

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
  describe('SHA256', () => {
    it('should return sha256 hashed data if input is string or number', () => {
      expect(SHA256('value')).toEqual(
        'cd42404d52ad55ccfa9aca4adc828aa5800ad9d385a0671fbcbf724118320619',
      );
    });
    it('should return undefined if input is undefined', () => {
      expect(SHA256(undefined)).toEqual(undefined);
    });
  });

  describe('containsAll', () => {
    it('should return true if array2 contains all of array1', () => {
      expect(containsAll(['pizza', 'cola'], ['pizza', 'cake', 'cola'])).toEqual(true);
    });
    it('should return false if array2 does not contain all of array1', () => {
      expect(containsAll(['pizza', 'cola', 'cheese'], ['pizza', 'cake', 'cola'])).toEqual(false);
    });
    it('should return true if array1 is empty array', () => {
      expect(containsAll([], ['pizza', 'cake', 'cola'])).toEqual(true);
    });
    it('should return false if array2 empty array', () => {
      expect(containsAll(['pizza', 'cola', 'cheese'], [])).toEqual(false);
    });
    it('should return true if both array1 and array2 empty array', () => {
      expect(containsAll([], [])).toEqual(true);
    });
  });
});
