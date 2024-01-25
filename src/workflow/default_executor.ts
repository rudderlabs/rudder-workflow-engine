import {
  ExecutionBindings,
  StepExitAction,
  WorkflowEngine,
  WorkflowExecutor,
  WorkflowOutput,
  logger,
} from '../common';
import { ErrorUtils, WorkflowExecutionError } from '../errors';

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

  private static handleError(error: any, workflowName: string, stepName: string) {
    throw new WorkflowExecutionError(
      error.message,
      ErrorUtils.getErrorStatus(error),
      workflowName,
      {
        stepName,
        childStepName: error.childStepName,
        error: error.error,
      },
    );
  }

  async execute(
    engine: WorkflowEngine,
    input: any,
    bindings?: Record<string, any>,
  ): Promise<WorkflowOutput> {
    const context = {};
    const executionBindings: ExecutionBindings = {
      ...engine.getBindings(),
      ...bindings,
      outputs: {},
      context,
      setContext: (key, value) => {
        context[key] = value;
      },
      originalInput: input,
    };

    let prevStepOutput: any;
    let currStepInput: any = input;
    const stepExecutors = engine.getStepExecutors();
    for (let i = 0; i < stepExecutors.length; i += 1) {
      const stepExecutor = stepExecutors[i];
      const step = stepExecutor.getStep();
      try {
        // eslint-disable-next-line no-await-in-loop
        const { skipped, output } = await stepExecutor.execute(currStepInput, executionBindings);
        if (!skipped) {
          prevStepOutput = output;
          executionBindings.outputs[step.name] = output;
          if (this.options.chainOutputs) {
            currStepInput = prevStepOutput;
          }
          if (step.onComplete === StepExitAction.Return) {
            break;
          }
        }
      } catch (error) {
        logger.error(`step: ${step.name} failed with error:`, error);
        if (step.onError !== StepExitAction.Continue) {
          DefaultWorkflowExecutor.handleError(error, engine.getName(), step.name);
        }
      }
    }

    return { output: prevStepOutput, outputs: executionBindings.outputs };
  }
}

export const chainExecutor = new DefaultWorkflowExecutor({ chainOutputs: true });
