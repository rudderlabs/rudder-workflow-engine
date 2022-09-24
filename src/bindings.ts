import jsonata from 'jsonata';
import { ReturnResultError } from './errors';

export { chunk } from 'lodash';
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
