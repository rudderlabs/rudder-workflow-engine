import cloneDeep from 'lodash/cloneDeep';
import { Logger } from 'pino';
import { getLogger } from './logger';
import { StepExecutorFactory } from './steps/factory';
import { StepExecutor, StepExitAction, StepType } from './steps/types';
import { Binding, Dictionary, ExecutionBindings, Workflow, WorkflowOutput } from './types';
import { WorkflowUtils } from './utils';
import * as libraryBindings from './bindings';
import { WorkflowExecutionError } from './errors';
import { WorkflowStepExecutor } from './steps';

export class WorkflowEngine {
  private readonly stepExecutors: StepExecutor[];
  readonly logger: Logger;
  readonly bindings: Dictionary<any>;
  constructor(workflow: Workflow, rootPath: string, ...bindingsPaths: string[]) {
    WorkflowUtils.validateWorkflow(workflow);
    WorkflowUtils.populateStepType(workflow);
    this.logger = getLogger(workflow?.name || 'Workflow');
    this.bindings = this.prepareBindings(rootPath, workflow.bindings, bindingsPaths);
    this.stepExecutors = workflow.steps.map((step) =>
      StepExecutorFactory.create(step, rootPath, this.bindings, this.logger),
    );
  }

  private prepareBindings(
    rootPath: string,
    workflowBindings?: Binding[],
    bindingsPaths?: string[],
  ) {
    return Object.assign(
      {},
      libraryBindings,
      WorkflowUtils.extractBindingsFromPaths(rootPath, bindingsPaths),
      WorkflowUtils.extractBindings(rootPath, workflowBindings),
    );
  }

  getStepExecutor(stepName: string, childStepName?: string): StepExecutor | undefined {
    let stepExecutor = this.stepExecutors.find(
      (stepExecutor) => stepExecutor.getStepName() === stepName,
    );
    if (childStepName && stepExecutor?.getStepType() === StepType.Workflow) {
      stepExecutor = (stepExecutor as WorkflowStepExecutor).getStepExecutor(childStepName);
    }
    return stepExecutor;
  }

  async execute(input: any, context: Record<string, any> = {}): Promise<WorkflowOutput> {
    const newContext = cloneDeep(context);
    const executionBindings: ExecutionBindings = {
      outputs: {},
      context: newContext,
      setContext: (key, value) => {
        newContext[key] = value;
      },
    };

    let finalOutput: any;
    for (const stepExecutor of this.stepExecutors) {
      const step = stepExecutor.getStep();
      try {
        const { skipped, output } = await stepExecutor.execute(input, executionBindings);
        if (skipped) {
          continue;
        }
        executionBindings.outputs[step.name] = output;
        finalOutput = output;
        if (step.onComplete === StepExitAction.Return) {
          break;
        }
      } catch (error) {
        if (step.onError === StepExitAction.Continue) {
          this.logger.error(`step: ${step.name} failed`, error);
          continue;
        }
        this.handleError(error, step.name);
      }
    }

    return { output: finalOutput, outputs: executionBindings.outputs };
  }

  handleError(error: any, stepName: string) {
    if (error instanceof WorkflowExecutionError) {
      throw error;
    }
    const status = WorkflowUtils.isAssertError(error)
      ? 400
      : error.response?.status || error.status || 500;
    throw new WorkflowExecutionError(error.message, status, stepName, error);
  }
}
