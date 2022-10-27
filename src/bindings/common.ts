import { at, identity } from 'lodash';
import { ReturnResultError, StatusError } from '../steps';
import { Dictionary } from '../common/types';

export { chunk } from 'lodash';

export function values(obj: Dictionary<any>): any[] {
  return Object.values(obj);
}

export function getByPaths(obj: any, paths: string | string[]): any {
  if (!obj || !paths) {
    return undefined;
  }
  const result = at(obj, paths).filter(identity);
  return Array.isArray(paths) ? result : result[0];
}

export function toArray(obj: any): any[] {
  if (obj === undefined) {
    return obj;
  }
  return Array.isArray(obj) ? obj : [obj];
}

export function doReturn(obj?: any) {
  throw new ReturnResultError(obj);
}

export function doThrow(message: string, status: number = 500) {
  throw new StatusError(message, +status);
}
