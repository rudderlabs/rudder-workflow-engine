import { StepCreationError } from '../errors';
import { CustomStep, Step, StepExecutor, StepType, WorkflowStep } from '../types';
import { SimpleStepExecutorFactory } from './simple';
import { WorkflowStepExecutor } from './executors/workflow_step';
import { BaseStepUtils } from './utils';
import { WorkflowOptionsInternal } from 'src/workflow';
import { BatchStepExecutorFactory } from './batch/factory';
import { CustomStepExecutorFactory } from './custom/factory';

export class BaseStepExecutorFactory {
  static create(step: Step, options: WorkflowOptionsInternal): Promise<StepExecutor> {
    switch (step.type) {
      case StepType.Simple:
        return SimpleStepExecutorFactory.create(step, options);
      case StepType.Workflow:
        return this.createWorkflowStepExecutor(step, options);
      case StepType.Batch:
        return BatchStepExecutorFactory.create(step, options);
      case StepType.Custom:
        return CustomStepExecutorFactory.create(step, options);
      default:
        throw new StepCreationError(`Unknown step type: ${step.type}`);
    }
  }

  static async createWorkflowStepExecutor(
    step: WorkflowStep,
    options: WorkflowOptionsInternal,
  ): Promise<WorkflowStepExecutor> {
    try {
      let newStep = await BaseStepUtils.prepareWorkflowStep(step, options);
      let simpleStepExecutors = await BaseStepUtils.createSimpleStepExecutors(newStep, options);
      return new WorkflowStepExecutor(newStep, simpleStepExecutors);
    } catch (error: any) {
      throw new StepCreationError(error.message, step.name, error.stepName);
    }
  }
}
