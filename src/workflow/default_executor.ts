import { StepExitAction } from '../steps/types';
import { ErrorUtils, logger } from '../common';
import { WorkflowExecutionError } from './errors';
import { ExecutionBindings, WorkflowExecutor, WorkflowOutput } from './types';
import { WorkflowEngine } from './engine';

export class DefaultWorkflowExecutor implements WorkflowExecutor {
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
    };

    let finalOutput: any;
    for (const stepExecutor of engine.stepExecutors) {
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
        logger.error(`step: ${step.name} failed with error:`);
        if (step.onError === StepExitAction.Continue) {
          logger.error(error);
          continue;
        }
        this.handleError(error, engine.name, step.name);
      }
    }

    return { output: finalOutput, outputs: executionBindings.outputs };
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
