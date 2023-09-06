import {
  CustomStep,
  CustomStepExecutor,
  CustomStepExecutorProvider,
  ExecutionBindings,
  Executor,
} from '../../../src';

export class TestCustomStepExecutorProvider implements CustomStepExecutorProvider {
  async provide(_step: CustomStep): Promise<Executor> {
    return new TestCustomStepExecutor();
  }
}

export class TestCustomStepExecutor implements CustomStepExecutor {
  execute(
    input: any,
    _bindings: ExecutionBindings,
    params?: Record<string, any> | undefined,
  ): Promise<any> {
    return Promise.resolve({ ...input, ...params });
  }
}

export const testCustomStepExecutorProvider = new TestCustomStepExecutorProvider();
export const testCustomStepExecutor = new TestCustomStepExecutor();
