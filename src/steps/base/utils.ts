import { join } from 'path';
import { Logger } from 'pino';
import { Dictionary } from '../../types';
import { WorkflowUtils } from '../../utils';
import { StepExecutorFactory } from '../factory';
import { SimpleStep, StepExecutor, StepType, WorkflowStep } from '../types';

export class BaseStepUtils {
  static populateWorkflowStep(step: WorkflowStep, rootPath: string): WorkflowStep {
    let newStep = step;
    if (step.workflowStepPath) {
      const workflowStepPath = join(rootPath, step.workflowStepPath);
      const workflowStepFromPath = WorkflowUtils.createFromFilePath<WorkflowStep>(workflowStepPath);
      newStep = Object.assign({}, workflowStepFromPath, step);
    }
    return newStep;
  }

  static async populateWorkflowStepAsync(
    step: WorkflowStep,
    rootPath: string,
  ): Promise<WorkflowStep> {
    let newStep = step;
    if (step.workflowStepPath) {
      const workflowStepPath = join(rootPath, step.workflowStepPath);
      const workflowStepFromPath = await WorkflowUtils.createFromFilePathAsync<WorkflowStep>(
        workflowStepPath,
      );
      newStep = Object.assign({}, workflowStepFromPath, step);
    }
    return newStep;
  }

  static createSimpleStepExecutors(
    steps: SimpleStep[],
    rootPath: string,
    bindings: Dictionary<any>,
    logger: Logger,
  ): StepExecutor[] {
    steps.forEach((step) => (step.type = StepType.Simple));
    return steps.map((step) => StepExecutorFactory.create(step, rootPath, bindings, logger));
  }

  static createSimpleStepExecutorsAsync(
    steps: SimpleStep[],
    rootPath: string,
    bindings: Dictionary<any>,
    logger: Logger,
  ): Promise<StepExecutor[]> {
    steps.forEach((step) => (step.type = StepType.Simple));
    return Promise.all(
      steps.map((step) => StepExecutorFactory.createAsync(step, rootPath, bindings, logger)),
    );
  }
}
