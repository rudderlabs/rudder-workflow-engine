import { Logger } from 'pino';
import { StepExecutor, StepExitAction } from '../steps/types';
import { Dictionary, Executor, ErrorUtils } from '../common';
import { WorkflowExecutionError } from './errors';
import { WorkflowStepExecutor } from '../steps';
import { ExecutionBindings, WorkflowOutput, Workflow } from './types';

export class WorkflowEngine implements Executor {
  readonly workflow: Workflow;
  readonly bindings: Dictionary<any>;
  private readonly logger: Logger;
  private readonly stepExecutors: StepExecutor[];

  constructor(
    workflow: Workflow,
    bindings: Dictionary<any>,
    logger: Logger,
    stepExecutors: StepExecutor[],
  ) {
    this.bindings = bindings;
    this.workflow = workflow;
    this.logger = logger;
    this.stepExecutors = stepExecutors;
  }

  getStepExecutor(stepName: string, childStepName?: string): StepExecutor {
    let stepExecutor = this.stepExecutors.find(
      (stepExecutor) => stepExecutor.getStepName() === stepName,
    );

    if (!stepExecutor) {
      throw new Error(`${stepName} was not found`);
    }

    if (childStepName) {
      const baseExecutor = stepExecutor.getBaseExecutor();
      if (baseExecutor instanceof WorkflowStepExecutor) {
        return baseExecutor.getStepExecutor(childStepName);
      }
      throw new Error(`${stepName} is not a workflow step`);
    }

    return stepExecutor;
  }

  async execute(input: any, bindings: Dictionary<any> = {}): Promise<WorkflowOutput> {
    const context = {};
    const executionBindings: ExecutionBindings = {
      ...bindings,
      outputs: {},
      context,
      setContext: (key, value) => {
        context[key] = value;
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
    throw new WorkflowExecutionError(
      error.message,
      ErrorUtils.getErrorStatus(error),
      this.workflow.name,
      stepName,
      error.childStepName,
      error.error,
    );
  }
}
