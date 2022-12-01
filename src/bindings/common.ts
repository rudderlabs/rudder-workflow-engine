import { at, identity } from 'lodash';
import { ReturnResultError } from '../steps';
import { Dictionary, StatusError } from '../common';

export { chunk } from 'lodash';

export function values(obj: Dictionary<any>): any[] {
  return Object.values(obj);
}

export function getOneByPaths(obj: any, paths: string | string[]): any {
  const newPaths = toArray(paths);
  if (!obj || !newPaths || !newPaths.length) {
    return undefined;
  }
  return at(obj, newPaths.shift())[0] ?? getOneByPaths(obj, newPaths);
}

export function getByPaths(obj: any, paths: string | string[]): any {
  if (!obj || !paths) {
    return undefined;
  }
  const result = at(obj, paths).filter(identity);
  return Array.isArray(paths) ? result : result[0];
}

export function toArray(obj: any): any[] | undefined {
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

export function toMilliseconds(timestamp: string): number {
  return new Date(timestamp).getTime();
}

export function toSeconds(timestamp: string): number {
  return Math.floor(toMilliseconds(timestamp) / 1000);
}
