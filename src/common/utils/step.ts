import { StepCreationError } from '../../errors';
import {
  BatchStep,
  CustomStep,
  SimpleStep,
  Step,
  StepExitAction,
  StepType,
  WorkflowStep,
} from '../types';
import { CommonUtils } from './common';

const stepNameRegex = /^[a-zA-Z][0-9a-zA-Z]*$/;
export class StepUtils {
  static getStepType(step: Step): StepType {
    if (StepUtils.isBatchStep(step)) {
      return StepType.Batch;
    }

    if (StepUtils.isCustomStep(step)) {
      return StepType.Custom;
    }

    if (StepUtils.isWorkflowStep(step)) {
      return StepType.Workflow;
    }
    if (StepUtils.isSimpleStep(step)) {
      return StepType.Simple;
    }
    return StepType.Unknown;
  }

  static isBatchStep(step: BatchStep) {
    return step.type === StepType.Batch;
  }

  static isCustomStep(step: BatchStep) {
    return step.type === StepType.Custom;
  }

  static isWorkflowStep(step: WorkflowStep): boolean {
    return !!step.steps?.length || !!step.workflowStepPath;
  }

  static isSimpleStep(step: SimpleStep): boolean {
    return (
      !!step.identity ||
      !!step.template ||
      !!step.templatePath ||
      !!step.functionName ||
      !!step.externalWorkflow
    );
  }

  static populateElseStep(step: Step) {
    if (step.else) {
      // eslint-disable-next-line no-param-reassign
      step.else.type = StepUtils.getStepType(step.else);
      this.populateElseStep(step.else);
    }
  }

  static populateSteps(steps: Step[]) {
    for (const step of steps) {
      step.type = StepUtils.getStepType(step);
      this.populateElseStep(step);
    }
  }

  private static checkForStepNameDuplicates(steps: Step[]) {
    const duplicateNames = CommonUtils.findDuplicateStrings(steps.map((step) => step.name));
    if (duplicateNames.length > 0) {
      throw new StepCreationError(`found duplicate step names: ${duplicateNames}`);
    }
  }

  static validateSteps(steps: Step[], notAllowedTypes?: string[]) {
    const notAllowed = notAllowedTypes ?? [];
    notAllowed.push(StepType.Unknown);
    this.checkForStepNameDuplicates(steps);
    for (let i = 0; i < steps.length; i += 1) {
      StepUtils.validateStep(steps[i], i, notAllowed);
    }
  }

  private static validateStepName(step: Step, index: number) {
    if (!step.name) {
      throw new StepCreationError(`step#${index} should have a name`);
    }

    if (!stepNameRegex.exec(step.name)) {
      throw new StepCreationError('step name is invalid', step.name);
    }
  }

  private static validateStepType(step: Step, index: number, notAllowed: string[]) {
    if (notAllowed.includes(step.type as StepType)) {
      throw new StepCreationError('unsupported step type', step.name);
    }
  }

  private static validateElseStep(step: Step, index: number, notAllowed: string[]) {
    if (step.else) {
      if (!step.condition) {
        throw new StepCreationError('else step should be used in a step with condition', step.name);
      } else {
        this.validateStep(step.else, index, notAllowed);
      }
    }
  }

  private static validateLoopStep(step: Step) {
    if (step.loopCondition && !step.loopOverInput) {
      throw new StepCreationError('loopCondition should be used with loopOverInput', step.name);
    }

    if (step.loopOverInput && step.type === StepType.Batch) {
      throw new StepCreationError('loopOverInput is not supported for batch step', step.name);
    }
  }

  private static validateOnComplete(step: Step) {
    if (step.onComplete === StepExitAction.Return && !step.condition) {
      throw new StepCreationError(
        '"onComplete = return" should be used in a step with condition',
        step.name,
      );
    }
  }

  static validateStep(step: Step, index: number, notAllowed: string[]) {
    this.validateStepName(step, index);

    this.validateStepType(step, index, notAllowed);

    this.validateElseStep(step, index, notAllowed);

    this.validateLoopStep(step);

    this.validateOnComplete(step);

    if (step.type === StepType.Batch) {
      this.ValidateBatchStep(step as BatchStep);
    }

    if (step.type === StepType.Custom) {
      this.ValidateCustomStep(step as CustomStep);
    }
  }

  static ValidateBatchStep(step: BatchStep) {
    if (!step.batches && !step.executor) {
      throw new StepCreationError('batches or executor is required for batch step', step.name);
    }

    if (step.batches && step.executor) {
      throw new StepCreationError('only one of batches or executor should be specified', step.name);
    }
  }

  static ValidateCustomStep(step: CustomStep) {
    if (!step.provider && !step.executor) {
      throw new StepCreationError('provider or executor is required for custom step', step.name);
    }
    if (step.executor && step.provider) {
      throw new StepCreationError(
        'only one of provider or executor should be specified',
        step.name,
      );
    }
  }
}
