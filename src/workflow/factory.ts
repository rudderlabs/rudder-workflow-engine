import { WorkflowUtils } from './utils';
import * as libraryBindings from '../bindings';
import { WorkflowCreationError } from './errors';
import { StepCreationError } from '../steps/errors';
import { WorkflowEngine } from './engine';
import { Step, StepExecutor, StepExecutorFactory, StepType, StepUtils } from '../steps';
import { Binding, Workflow, WorkflowOptions, WorkflowOptionsInternal } from './types';

export class WorkflowEngineFactory {
  private static prepareWorkflow(workflow: Workflow, options: WorkflowOptions) {
    WorkflowUtils.validateWorkflow(workflow);
    options.templateType = workflow.templateType || options.templateType;
    StepUtils.populateSteps(workflow.steps);
    StepUtils.validateSteps(workflow.steps, [StepType.Simple, StepType.Workflow]);
  }

  static async create(workflow: Workflow, options: WorkflowOptions): Promise<WorkflowEngine> {
    try {
      this.prepareWorkflow(workflow, options);
      const optionsInteranl = options as WorkflowOptionsInternal;
      const bindings = await this.prepareBindings(workflow.bindings || [], optionsInteranl);
      optionsInteranl.currentBindings = bindings;
      const stepExecutors = await this.createStepExecutors(workflow.steps, optionsInteranl);
      return new WorkflowEngine(workflow.name, bindings, stepExecutors);
    } catch (error: any) {
      if (error instanceof WorkflowCreationError) {
        throw error;
      }

      if (error instanceof StepCreationError) {
        throw new WorkflowCreationError(
          error.message,
          workflow.name,
          error.stepName,
          error.childStepName,
        );
      }

      throw new WorkflowCreationError(error.message, workflow.name);
    }
  }

  static async createFromFilePath(
    workflowPath: string,
    options: WorkflowOptions,
  ): Promise<WorkflowEngine> {
    const workflow = await WorkflowUtils.createWorkflowFromFilePath(workflowPath);
    return this.create(workflow, options);
  }

  private static async prepareBindings(
    workflowBindings: Binding[],
    options: WorkflowOptionsInternal,
  ): Promise<Record<string, any>> {
    return Object.assign(
      {},
      libraryBindings,
      await WorkflowUtils.extractBindingsFromPaths(options),
      await WorkflowUtils.extractBindings(workflowBindings, options),
      options.creationTimeBindings,
    );
  }

  private static createStepExecutors(
    steps: Step[],
    options: WorkflowOptionsInternal,
  ): Promise<StepExecutor[]> {
    return Promise.all(steps.map((step) => StepExecutorFactory.create(step, options)));
  }
}
