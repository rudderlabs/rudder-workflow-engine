import { Logger } from 'pino';
import { Dictionary } from '../types';
import { ComposableExecutorFactory } from './composed';
import { Step, StepExecutor } from './types';
import { BaseStepExecutorFactory } from './base/factory';
import { StepCreationError } from './errors';

export class StepExecutorFactory {
  static create(
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): StepExecutor {
    try {
      let stepExecutor: StepExecutor = BaseStepExecutorFactory.create(
        step,
        rootPath,
        bindings,
        parentLogger,
      );
      stepExecutor = ComposableExecutorFactory.create(step, stepExecutor);
      return stepExecutor;
    } catch (error: any) {
      throw new StepCreationError(error.message, step.name);
    }
  }

  static async createAsync(
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<StepExecutor> {
    try {
      let stepExecutor: StepExecutor = await BaseStepExecutorFactory.createAsync(
        step,
        rootPath,
        bindings,
        parentLogger,
      );
      stepExecutor = ComposableExecutorFactory.create(step, stepExecutor);
      return stepExecutor;
    } catch (error: any) {
      throw new StepCreationError(error.message, step.name);
    }
  }
}
