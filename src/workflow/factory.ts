import * as libraryBindings from '../bindings';
import {
  Binding,
  Step,
  StepExecutor,
  Workflow,
  WorkflowEngine,
  WorkflowOptions,
  WorkflowOptionsInternal,
} from '../common/types';
import { StepUtils } from '../common/utils';
import { StepCreationError, WorkflowCreationError } from '../errors';
import { DefaultWorkflowEngine } from './engine';
import { WorkflowUtils } from './utils';

export class WorkflowEngineFactory {
  private static prepareWorkflow(workflow: Workflow, options: WorkflowOptions) {
    WorkflowUtils.validateWorkflow(workflow);
    // eslint-disable-next-line no-param-reassign
    options.templateType = workflow.templateType ?? options.templateType;
    StepUtils.populateSteps(workflow.steps);
    StepUtils.validateSteps(workflow.steps);
  }

  static async create(
    workflow: Workflow,
    options: WorkflowOptions | WorkflowOptionsInternal,
  ): Promise<WorkflowEngine> {
    try {
      this.prepareWorkflow(workflow, options);
      const optionsInteranl = options as WorkflowOptionsInternal;
      const bindings = await this.prepareBindings(workflow.bindings ?? [], optionsInteranl);
      optionsInteranl.currentBindings = bindings;
      const executor = await WorkflowUtils.getExecutor(workflow, optionsInteranl);
      const stepExecutors = await this.createStepExecutors(workflow.steps, optionsInteranl);
      WorkflowUtils.validateOutputs(workflow);
      return new DefaultWorkflowEngine(workflow.name, executor, bindings, stepExecutors);
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

  static async createFromYaml(
    yamlString: string,
    options: WorkflowOptions,
  ): Promise<WorkflowEngine> {
    const workflow = WorkflowUtils.createFromYaml<Workflow>(yamlString);
    return this.create(workflow, options);
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
    return {
      ...libraryBindings,
      ...(await WorkflowUtils.extractWorkflowOptionsBindings(options)),
      ...(await WorkflowUtils.extractBindings(options, workflowBindings)),
      ...options.creationTimeBindings,
    };
  }

  private static async createStepExecutors(
    steps: Step[],
    options: WorkflowOptionsInternal,
  ): Promise<StepExecutor[]> {
    const { StepExecutorFactory } = await import('../steps' as string);
    return Promise.all(steps.map((step) => StepExecutorFactory.create(step, options)));
  }
}
