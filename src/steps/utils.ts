import { CommonUtils } from '../common/utils';
import { StepCreationError } from './errors';
import { SimpleStep, Step, StepExitAction, StepType, WorkflowStep } from './types';

export class StepUtils {
  static getStepType(step: Step): StepType {
    if (StepUtils.isWorkflowStep(step)) {
      return StepType.Workflow;
    }
    if (StepUtils.isSimpleStep(step)) {
      return StepType.Simple;
    }
    return StepType.Unknown;
  }

  static isWorkflowStep(step: WorkflowStep): boolean {
    return !!step.steps?.length || !!step.workflowStepPath;
  }

  static isSimpleStep(step: SimpleStep): boolean {
    return !!step.template || !!step.templatePath || !!step.functionName || !!step.externalWorkflow;
  }

  static populateSteps(steps: Step[]) {
    for (const step of steps) {
      step.type = StepUtils.getStepType(step);
    }
  }

  private static checkForStepNameDuplicates(steps: Step[]) {
    const duplicateNames = CommonUtils.findDuplicateStrings(steps.map((step) => step.name));
    if (duplicateNames.length > 0) {
      throw new StepCreationError(`found duplicate step names: ${duplicateNames}`);
    }
  }

  static validateSteps(steps: Step[], allowedStepTypes: string[]) {
    this.checkForStepNameDuplicates(steps);
    for (let i = 0; i < steps.length; i++) {
      StepUtils.validateStep(steps[i], i, allowedStepTypes);
    }
  }

  static validateStep(step: Step, index: number, allowedStepTypes: string[]) {
    if (!step.name) {
      throw new StepCreationError(`step#${index} should have a name`);
    }

    if (!step.name.match(/^[a-zA-Z][0-9a-zA-Z]*$/)) {
      throw new StepCreationError('step name is invalid', step.name);
    }

    if (!allowedStepTypes.includes(step.type as StepType)) {
      throw new StepCreationError('Invalid step configuration', step.name);
    }

    if (step.onComplete === StepExitAction.Return && !step.condition) {
      throw new StepCreationError(
        '"onComplete = return" should be used in a step with condition',
        step.name,
      );
    }
  }
}
