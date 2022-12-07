import { ExecutionBindings } from 'src/workflow';

export interface Executor {
  execute(input: any, bindings?: ExecutionBindings): Promise<any>;
}

export enum LogLevel {
  DEBUG = 0,
  INFO,
  WARN,
  ERROR,
}
