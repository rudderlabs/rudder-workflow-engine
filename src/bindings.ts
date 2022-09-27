import jsonata from 'jsonata';
import { WorkflowEngineError, ReturnResultError } from './errors';
import { Dictionary } from './types';

export { chunk } from 'lodash';

export function values(obj: Dictionary<any>): any[] {
  return Object.values(obj);
}

export function getByPaths(obj: any, paths: string | string[]): any {
  if (obj === undefined || paths === undefined) {
    return undefined;
  }
  let pathStr: string = Array.isArray(paths) ? `[${paths.join(',')}]` : paths;
  pathStr = pathStr.replace(/\.0/g, '[0]');
  return jsonata(pathStr).evaluate(obj);
}
export function doReturn(obj?: any) {
  throw new ReturnResultError(obj);
}

export function doThrow(message: string, status: number = 500) {
  throw new WorkflowEngineError(message, +status);
}
