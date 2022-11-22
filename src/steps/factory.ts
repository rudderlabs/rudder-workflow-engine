import { Logger } from 'pino';
import { Dictionary } from '../common/types';
import { ComposableExecutorFactory } from './composed';
import { Step, StepExecutor } from './types';
import { BaseStepExecutorFactory } from './base/factory';
import { StepCreationError } from './errors';
import { Workflow } from 'src/workflow';

export class StepExecutorFactory {
  static async create(
    workflow: Workflow,
    step: Step,
    rootPath: string,
    bindings: Dictionary<any>,
    parentLogger: Logger,
  ): Promise<StepExecutor> {
    try {
      let stepExecutor: StepExecutor = await BaseStepExecutorFactory.create(
        workflow,
        step,
        rootPath,
        bindings,
        parentLogger,
      );
      stepExecutor = ComposableExecutorFactory.create(step, stepExecutor);
      return stepExecutor;
    } catch (error: any) {
      if (error instanceof StepCreationError) {
        throw error;
      }
      throw new StepCreationError(error.message, step.name);
    }
  }
}
