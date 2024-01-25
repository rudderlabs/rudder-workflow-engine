import { join } from 'path';
import { StepType, WorkflowOptionsInternal, WorkflowStep } from '../../common';
import { StepUtils } from '../../common/utils';
import { StepCreationError } from '../../errors';
import { WorkflowUtils } from '../../workflow/utils';

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

  static validateWorkflowStep(workflowStep: WorkflowStep) {
    if (!workflowStep.steps?.length) {
      throw new StepCreationError('Invalid workflow step configuration', workflowStep.name);
    }
    StepUtils.populateSteps(workflowStep.steps);
    StepUtils.validateSteps(workflowStep.steps, [StepType.Workflow]);
  }
}
