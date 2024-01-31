import { BatchResult, CustomStep, ExecutionBindings } from '../common';
import {
  type JsonTemplateStepExecutor,
  type JsonataStepExecutor,
} from './base/simple/executors/template';

export interface BatchExecutor {
  execute(input: any[], bindings: ExecutionBindings): Promise<BatchResult[]>;
}

export interface CustomStepExecutor {
  execute(input: any, bindings: ExecutionBindings, params?: Record<string, any>): Promise<any>;
}
export interface CustomStepExecutorProvider {
  provide(step: CustomStep): Promise<CustomStepExecutor>;
}

export type TemplateStepExecutor = JsonTemplateStepExecutor | JsonataStepExecutor;
