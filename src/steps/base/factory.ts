import {
  SimpleStep,
  Step,
  StepExecutor,
  StepType,
  WorkflowOptionsInternal,
  WorkflowStep,
} from '../../common';
import { StepCreationError } from '../../errors';
import { BatchStepExecutorFactory } from './batch/factory';
import { CustomStepExecutorFactory } from './custom/factory';
import { WorkflowStepExecutor } from './executors/workflow_step';
import { SimpleStepExecutorFactory } from './simple';
import { BaseStepUtils } from './utils';
import { StepExecutorFactory } from '../factory';

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
      const newStep = await BaseStepUtils.prepareWorkflowStep(step, options);
      const simpleStepExecutors = await this.createSimpleStepExecutors(newStep, options);
      return new WorkflowStepExecutor(newStep, simpleStepExecutors);
    } catch (error: any) {
      throw new StepCreationError(error.message, step.name, error.stepName);
    }
  }

  static async createSimpleStepExecutors(
    workflowStep: WorkflowStep,
    options: WorkflowOptionsInternal,
  ): Promise<StepExecutor[]> {
    const steps = workflowStep.steps as SimpleStep[];
    return Promise.all(steps.map((step) => StepExecutorFactory.create(step, options)));
  }
}
