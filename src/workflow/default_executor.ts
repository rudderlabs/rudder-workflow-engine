import { StepExitAction } from '../steps/types';
import { ErrorUtils, logger } from '../common';
import { WorkflowExecutionError } from './errors';
import { ExecutionBindings, WorkflowExecutor, WorkflowOutput } from './types';
import { WorkflowEngine } from './engine';

interface DefaultWorkflowExecutorOptions {
  // In chainOutputs use set then => input -> step -> step2 -> step3 -> output
  chainOutputs?: boolean;
}

export class DefaultWorkflowExecutor implements WorkflowExecutor {
  readonly options: DefaultWorkflowExecutorOptions;
  constructor(options?: DefaultWorkflowExecutorOptions) {
    this.options = options || {};
  }

  static readonly INSTANCE = new DefaultWorkflowExecutor();
  async execute(engine: WorkflowEngine, input: any): Promise<WorkflowOutput> {
    const context = {};
    const executionBindings: ExecutionBindings = {
      ...engine.bindings,
      outputs: {},
      context,
      setContext: (key, value) => {
        context[key] = value;
      },
      originalInput: input,
    };

    let prevStepOutput: any;
    let currStepInput: any = input;
    for (const stepExecutor of engine.stepExecutors) {
      const step = stepExecutor.getStep();
      try {
        const { skipped, output } = await stepExecutor.execute(currStepInput, executionBindings);
        if (skipped) {
          continue;
        }
        prevStepOutput = executionBindings.outputs[step.name] = output;
        if (this.options.chainOutputs) {
          currStepInput = prevStepOutput;
        }
        if (step.onComplete === StepExitAction.Return) {
          break;
        }
      } catch (error) {
        logger.error(`step: ${step.name} failed with error:`);
        if (step.onError === StepExitAction.Continue) {
          logger.error(error);
          continue;
        }
        this.handleError(error, engine.name, step.name);
      }
    }

    return { output: prevStepOutput, outputs: executionBindings.outputs };
  }

  handleError(error: any, workflowName: string, stepName: string) {
    throw new WorkflowExecutionError(
      error.message,
      ErrorUtils.getErrorStatus(error),
      workflowName,
      stepName,
      error.childStepName,
      error.error,
    );
  }
}

export const chainExecutor = new DefaultWorkflowExecutor({ chainOutputs: true });
