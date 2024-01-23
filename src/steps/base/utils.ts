import { join } from 'path';
import { WorkflowOptionsInternal } from 'src/workflow';
import { WorkflowUtils } from '../../workflow/utils';
import { SimpleStep, StepExecutor, StepType, WorkflowStep } from '../types';
import { StepUtils } from '../utils';
import { StepCreationError } from '../errors';
import { StepExecutorFactory } from '../factory';

export class BaseStepUtils {
  static async prepareWorkflowStep(
    step: WorkflowStep,
    options: WorkflowOptionsInternal,
  ): Promise<WorkflowStep> {
    let newStep = step;
    if (step.workflowStepPath) {
      const workflowStepPath = join(options.rootPath, step.workflowStepPath);
      const workflowStepFromPath = await WorkflowUtils.createFromFilePath<WorkflowStep>(
        workflowStepPath,
      );
      newStep = { ...workflowStepFromPath, ...step };
    }
    BaseStepUtils.validateWorkflowStep(newStep);
    return newStep;
  }

  static createSimpleStepExecutors(
    workflowStep: WorkflowStep,
    options: WorkflowOptionsInternal,
  ): Promise<StepExecutor[]> {
    const steps = workflowStep.steps as SimpleStep[];
    return Promise.all(steps.map((step) => StepExecutorFactory.create(step, options)));
  }

  static validateWorkflowStep(workflowStep: WorkflowStep) {
    if (!workflowStep.steps?.length) {
      throw new StepCreationError('Invalid workflow step configuration', workflowStep.name);
    }
    StepUtils.populateSteps(workflowStep.steps);
    StepUtils.validateSteps(workflowStep.steps, [StepType.Workflow]);
  }
}
