import { cloneDeep } from 'lodash';
import { Logger } from 'pino';
import {
  Step,
  Workflow,
  WorkflowInternal,
  StepInternal,
  WorkflowOutput,
  WorkflowStep,
  StepExitAction,
  StepOutput,
  WorkflowStepInternal,
  SimpleStepInternal,
  StepType,
} from './types';
import { WorkflowUtils } from './utils';
import { CustomError } from './errors';
import * as commonBindings from './bindings';
import { getLogger } from './logger';

export class WorkflowEngine {
  private workflow: WorkflowInternal;
  // bindings will be resolved relative to root path
  readonly rootPath: string;
  readonly logger: Logger;
  constructor(workflow: Workflow, rootPath: string) {
    this.logger = getLogger(workflow?.name || 'Workflow');
    this.rootPath = rootPath;
    this.workflow = this.prepareWorkflow(workflow);
  }

  private prepareBindings(workflow: Workflow) {
    this.workflow.bindings = Object.assign(
      {},
      commonBindings,
      WorkflowUtils.extractBindings(this.rootPath, workflow.bindings),
      { log: this.logger.info },
    );

    // As this is 8*times faster
    // May be suitable for our use-case
    // Ref: https://jsbench.me/6dkh13vqrr/1
    // for (let index=0; index < workflow.steps.length; index++) {
    //   const step = workflow.steps[index];
    //   if (WorkflowUtils.isWorkflowStep(step)) {
    //     const workflowStep = step as WorkflowStep;
    //     const wfStepInternal = this.workflow.steps[index] as WorkflowStepInternal
    //     wfStepInternal.bindings = WorkflowUtils.extractBindings(this.rootPath, workflowStep.bindings);
    //   }
    // }
  }

  private populateStep(step: Step): StepInternal | undefined {
    const stepType = WorkflowUtils.getStepType(step);
    const stepInternal = WorkflowUtils.getStepInternal({
      step,
      stepType,
      bindings: this.workflow.bindings,
      rootPath: this.rootPath,
    });
    // TODO: Need to think through if this fits here(source-code wise not use-case)
    // if (step.inputTemplate) {
    //   stepInternal.inputTemplateExpression = jsonata(step.inputTemplate);
    // }
    if (WorkflowUtils.isWorkflowStep(step)) {
      const workflowStep = step as WorkflowStep;
      (stepInternal as WorkflowStepInternal).bindings = WorkflowUtils.extractBindings(
        this.rootPath,
        workflowStep.bindings,
      );
    }
    return stepInternal;
  }

  private prepareWorkflow(workflow: Workflow): WorkflowInternal {
    WorkflowUtils.validateWorkflow(workflow);
    // This is engine-specific
    this.workflow = cloneDeep(workflow) as WorkflowInternal;
    this.prepareBindings(workflow);

    // As this is 8*times faster
    // May be suitable for our use-case
    // Benchmark Ref: https://jsbench.me/6dkh13vqrr/1
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      try {
        const stepInternal = this.populateStep(step);
        if (!stepInternal) {
          throw new CustomError('Step is not a supported type', 400, step.name);
        }
        this.workflow.steps[i] = stepInternal;
      } catch (e) {
        this.logger.error(`${step.name} is failed to populate`);
        throw e;
      }
    }
    return this.workflow;
  }

  getWorkflow(): WorkflowInternal {
    return this.workflow;
  }

  private async executeStepInternal(
    step: StepInternal,
    input: any,
    bindings: Record<string, any> = {},
  ): Promise<StepOutput> {
    let stepInput = input;
    if (step.debug) {
      this.logger.debug('Workflow Input', input);
      this.logger.debug('Step bindings', bindings);
    }
    if (step.inputTemplateExpression) {
      stepInput = await WorkflowUtils.jsonataPromise(step.inputTemplateExpression, input, bindings);
    }

    let stepOutput: StepOutput = {};
    // Can we do this ?
    const workflowBindings = this.workflow.bindings;
    bindings = Object.assign({}, workflowBindings, bindings);

    if (step.loopOverInput) {
      if (!Array.isArray(stepInput)) {
        throw new CustomError('loopOverInput is not supported for non-array input', 500, step.name);
      }
      const results = await Promise.all(
        stepInput.map(async (inputElement) => {
          try {
            return await step.execute(inputElement, bindings);
          } catch (error: any) {
            return {
              error: {
                status: error.response?.status || 500,
                message: error.message,
              },
            };
          }
        }),
      );
      stepOutput.output = results;
    } else {
      stepOutput = await step.execute(stepInput, bindings);
    }
    if (step.debug) {
      this.logger.debug('Step output', stepOutput);
    }
    return stepOutput;
  }

  async execute(input: any, bindings: Record<string, any> = {}): Promise<WorkflowOutput> {
    bindings = cloneDeep(bindings);
    bindings.context = bindings.context || {};
    bindings.outputs = {};

    let finalOutput: any;
    for (const step of this.workflow.steps) {
      try {
        const { skipped, output } = await this.executeStepInternal(step, input, bindings);
        if (skipped) {
          continue;
        }
        bindings.outputs[step.name] = output;
        finalOutput = output;
        if (step.onComplete === StepExitAction.Return) {
          break;
        }
      } catch (error) {
        if (step.onError === StepExitAction.Continue) {
          this.logger.error(`step: ${step.name} failed`, error);
          continue;
        }
        return this.handleError(error, step.name);
      }
    }

    return { output: finalOutput, outputs: bindings.outputs };
  }

  handleError(error: any, stepName: string): WorkflowOutput {
    const status = WorkflowUtils.isAssertError(error)
      ? 400
      : error.response?.status || error.status || 500;
    throw new CustomError(error.message, status, stepName);
  }
}
