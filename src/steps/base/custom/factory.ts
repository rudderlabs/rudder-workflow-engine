import {
  CustomStep,
  CustomStepExecutor,
  CustomStepExecutorProvider,
  StepExecutor,
} from '../../../steps/types';
import { StepCreationError } from '../../../steps/errors';
import { WorkflowOptionsInternal } from '../../../workflow';
import { BaseCustomStepExecutor } from './step_executor';

export class CustomStepExecutorFactory {
  static async create(step: CustomStep, options: WorkflowOptionsInternal): Promise<StepExecutor> {
    const executor = await this.getExecutor(step, options);
    return new BaseCustomStepExecutor(step, executor);
  }

  private static async getExecutor(
    step: CustomStep,
    options: WorkflowOptionsInternal,
  ): Promise<CustomStepExecutor> {
    if (step.provider) {
      return this.getExecutorFromProvider(step, options);
    }
    const executor = options.currentBindings[step.executor as string] as CustomStepExecutor;
    if (!executor?.execute) {
      throw new StepCreationError(`Invalid custom step executor: ${step.executor}`, step.name);
    }
    return executor;
  }

  private static getExecutorFromProvider(
    step: CustomStep,
    options: WorkflowOptionsInternal,
  ): Promise<CustomStepExecutor> {
    const provider = options.currentBindings[step.provider as string] as CustomStepExecutorProvider;
    if (!provider?.provide) {
      throw new StepCreationError(`Invalid custom step provider: ${step.provider}`, step.name);
    }
    return provider.provide(step);
  }
}
