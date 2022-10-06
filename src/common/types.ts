export type Dictionary<T> = Record<string, T>;

export interface Executor {
  execute(input: any, bindings?: Dictionary<any>): Promise<any>
}
