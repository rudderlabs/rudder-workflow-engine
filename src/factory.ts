import { Binding, Dictionary, Workflow } from './types';
import { WorkflowUtils } from './utils';
import * as libraryBindings from './bindings';
import { WorkflowCreationError } from './errors';
import { StepCreationError } from './steps/errors';
import { WorkflowEngine } from './workflow';
import { Step, StepExecutor, StepExecutorFactory, StepType, StepUtils } from './steps';
import { getLogger } from './logger';
import { Logger } from 'pino';

export class WorkflowEngineFactory {
  private static prepareWorkflow(workflow: Workflow) {
    WorkflowUtils.validateWorkflow(workflow);
    StepUtils.populateSteps(workflow.steps);
    StepUtils.validateSteps(workflow.steps, [StepType.Simple, StepType.Workflow]);
  }

  static async create(
    workflow: Workflow,
    rootPath: string,
    bindingsPaths?: string[],
  ): Promise<WorkflowEngine> {
    try {
      this.prepareWorkflow(workflow);
      const bindings = await this.prepareBindings(rootPath, workflow.bindings, bindingsPaths);
      const logger = getLogger(workflow.name);
      const stepExecutors = await this.createStepExecutors(
        workflow.steps,
        rootPath,
        bindings,
        logger,
      );
      return new WorkflowEngine(workflow.name, logger, stepExecutors);
    } catch (error: any) {
      if (error instanceof WorkflowCreationError) {
        throw error;
      }

      if (error instanceof StepCreationError) {
        throw new WorkflowCreationError(error.message, workflow.name, error.stepName, error.childStepName);
      }

      throw new WorkflowCreationError(error.message, workflow.name);
    }
  }

  static async createFromFilePath(
    workflowPath: string,
    rootPath: string,
    bindingsPaths?: string[],
  ): Promise<WorkflowEngine> {
    const workflow = await WorkflowUtils.createWorkflowFromFilePath(workflowPath);
    return this.create(workflow, rootPath, bindingsPaths);
  }

  private static async prepareBindings(
    rootPath: string,
    workflowBindings?: Binding[],
    bindingsPaths?: string[],
  ): Promise<Dictionary<any>> {
    return Object.assign(
      {},
      libraryBindings,
      await WorkflowUtils.extractBindingsFromPaths(rootPath, bindingsPaths),
      await WorkflowUtils.extractBindings(rootPath, workflowBindings),
    );
  }

  private static createStepExecutors(
    steps: Step[],
    rootPath: string,
    bindings: Dictionary<any>,
    logger: Logger,
  ): Promise<StepExecutor[]> {
    return Promise.all(
      steps.map((step) => StepExecutorFactory.create(step, rootPath, bindings, logger)),
    );
  }
}
