import { at, identity } from 'lodash';
import { ReturnResultError } from '../steps';
import { StatusError } from '../common';

export { debug, info, warn, error } from '../common/logger';

export { chunk, sum } from 'lodash';

export function values(obj: Record<string, any>): any[] {
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
  throw new StatusError(message, Number(status));
}

export function toMilliseconds(timestamp: string): number | undefined {
  const time = new Date(timestamp).getTime();
  if (!time) {
    return undefined;
  }
  return time;
}

export function toSeconds(timestamp: string): number | undefined {
  const timeInMillis = toMilliseconds(timestamp);
  if (!timeInMillis) {
    return undefined;
  }
  return Math.floor(timeInMillis / 1000);
}
