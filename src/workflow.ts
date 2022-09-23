import yaml from 'js-yaml';
import { cloneDeep } from 'lodash';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  Step,
  Workflow,
  StepType,
  WorkflowInternal,
  StepInternal,
  WorkflowOutput,
  StepOutput,
  StepExitAction,
} from './types';
import { WorkflowUtils } from './utils';
import jsonata from 'jsonata';
import { CustomError } from './errors';
import * as commonBindings from './bindings';
import { Logger } from 'pino';
import { getLogger } from './logger';

export class WorkflowEngine {
  private workflow: WorkflowInternal;
  // bindings will be resolved relative to root path
  readonly rootPath: string;
  readonly logger: Logger;
  constructor(workflow: Workflow, rootPath: string) {
    this.logger = getLogger(workflow?.name || 'Workflow');
    this.rootPath = rootPath;
    this.workflow = WorkflowUtils.createInternalWorkflow(workflow);
  }

  getWorkflow(): WorkflowInternal {
    return this.workflow;
  }

  private populateSimpleStep(step: SimpleStepInternal, bindings: Record<string, any> = {}) {
    if (step.condition) {
      step.conditionExpression = jsonata(step.condition);
    }
    if (step.externalWorkflow) {
      const externalWorkflow = WorkflowUtils.createFromFilePath(
        join(this.rootPath, step.externalWorkflow.path),
      );
      const externalWorkflowRootPath = join(this.rootPath, step.externalWorkflow.rootPath || '');
      step.externalWorkflowEngine = new WorkflowEngine(externalWorkflow, externalWorkflowRootPath);
    }
    if (step.templatePath) {
      step.template = readFileSync(join(this.rootPath, step.templatePath), 'utf-8');
    }
    if (step.template) {
      step.templateExpression = jsonata(step.template);
    }
    if (step.functionName) {
      step.function = bindings[step.functionName];
      if (typeof step.function !== "function") {
        throw new CustomError("Invalid functionName", 400, step.name);
      }
    }
  }

  private prepareStepsForWorkflow(workflowPath: string): WorkflowStepInternal {
    const workflowStepsData: string = readFileSync(join(this.rootPath, workflowPath), 'utf-8');
    return yaml.load(workflowStepsData) as WorkflowStepInternal;
  }

  private populateWorkflowStep(step: WorkflowStepInternal) {
    if (step.condition) {
      step.conditionExpression = jsonata(step.condition);
    }
    if (step.workflowStepPath) {
      const newWorkflowStep = this.prepareStepsForWorkflow(step.workflowStepPath);
      step.bindings = Object.assign({}, newWorkflowStep.bindings, step.bindings);
      step.steps = newWorkflowStep.steps;
    }
    if (step.steps) {
      for (const subStep of step.steps) {
        subStep.type = StepType.Simple;
        this.populateSimpleStep(subStep, step.bindings);
      }
    }
  }

  private populateStep(step: StepInternal) {
    step.type = step.type || WorkflowUtils.getStepType(step);
    if (step.inputTemplate) {
      step.inputTemplateExpression = jsonata(step.inputTemplate);
    }
    if (step.type === StepType.Simple) {
      this.populateSimpleStep(step, this.workflow.bindingsInternal);
    } else if (step.type === StepType.Workflow) {
      this.populateWorkflowStep(step);
    }
  }

  private prepareWorkflow(workflow: Workflow): WorkflowInternal {
    WorkflowUtils.validateWorkflow(workflow);
    this.workflow = cloneDeep(workflow) as WorkflowInternal;
    this.prepareBindings(this.workflow);
    for (const step of this.workflow.steps) {
      try {
        this.populateStep(step);
      } catch (e) {
        this.logger.error(`${step.name} is failed to populate`);
        throw e;
      }
    }
    return this.workflow;
  }

  private prepareBindings(workflow: WorkflowInternal) {
    workflow.bindingsInternal = Object.assign(
      {},
      commonBindings,
      WorkflowUtils.extractBindings(this.rootPath, workflow.bindings),
      { log: this.logger.info },
    );
    for (const step of this.workflow.steps) {
      if (WorkflowUtils.isWorkflowStep(step)) {
        const workflowStep = step as WorkflowStepInternal;
        workflowStep.bindingsInternal = WorkflowUtils.extractBindings(this.rootPath, workflowStep.bindings);
      }
    }
  }

  shouldSkipStep(step: StepInternal, input: any, bindings: Record<string, any> = {}): boolean {
    const allBindings = Object.assign({}, 
      this.workflow.bindingsInternal, 
      (step as WorkflowStepInternal).bindingsInternal,
      bindings);
    return !!step.conditionExpression && !step.conditionExpression.evaluate(input, allBindings);
  }

  private getContextFunctions(context: Record<string, any> = {}) {
    return {
      setContext: (key, value) => {
        context[key] = value;
      },
    };
  }

  private async executeSimpleStep(
    step: SimpleStepInternal,
    input: any,
    bindings: Record<string, any> = {},
  ): Promise<StepOutput> {
    bindings.context = bindings.context || {};
    const allBindings = Object.assign(
      {},
      this.workflow.bindingsInternal,
      bindings,
      this.getContextFunctions(bindings.context),
    );
    if (step.externalWorkflowEngine) {
      return step.externalWorkflowEngine.execute(input, { context: bindings.context });
    }
    if (step.function) {
      return step.function(input, allBindings);
    } else if (step.templateExpression) {
      return {
        output: await WorkflowUtils.jsonataPromise(step.templateExpression, input, allBindings),
      };
    }
    throw new CustomError('Invalid simple step configuration', 500, step.name);
  }

  private async executeWorkflowStep(
    workflowStep: WorkflowStepInternal,
    input: any,
    bindings: Record<string, any> = {},
  ): Promise<StepOutput> {
    bindings.outputs[workflowStep.name] = {};
    let finalOutput: any;
    for (const simpleStep of workflowStep.steps as SimpleStepInternal[]) {
      const allBindings = Object.assign({}, workflowStep.bindingsInternal, bindings);
      const { skipped, output } = await this.executeStepInternal(simpleStep, input, allBindings);
      if (!skipped) {
        bindings.outputs[workflowStep.name][simpleStep.name] = output;
        finalOutput = output;
      }
    }

    return { outputs: bindings.outputs[workflowStep.name], output: finalOutput };
  }

  private executeStepIteration(
    step: StepInternal,
    input: any,
    bindings: Record<string, any> = {},
  ): Promise<StepOutput> {
    switch (step.type) {
      case StepType.Simple:
        return this.executeSimpleStep(step, input, bindings);
      case StepType.Workflow:
        return this.executeWorkflowStep(step, input, bindings);
    }
    throw new CustomError('Invalid step configuration', 500, step.name);
  }

  private findStep(steps, stepName): StepInternal | undefined {
    return steps.find((step) => step.name === stepName);
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
    if (this.shouldSkipStep(step, input, bindings)) {
      return { skipped: true };
    }

    if (step.inputTemplateExpression) {
      stepInput = await WorkflowUtils.jsonataPromise(step.inputTemplateExpression, input, bindings);
    }

    let stepOutput: StepOutput = {};
    if (step.loopOverInput) {
      if (!Array.isArray(stepInput)) {
        throw new CustomError('loopOverInput is not supported for non-array input', 500, step.name);
      }
      const results = await Promise.all(
        stepInput.map(async (inputElement) => {
          try {
            return await this.executeStepIteration(step, inputElement, bindings);
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
      stepOutput = await this.executeStepIteration(step, stepInput, bindings);
    }
    if (step.debug) {
      this.logger.debug('Step output', stepOutput);
    }
    return stepOutput;
  }

  getStep(stepName: string, subStepName?: string): StepInternal {
    let step = this.findStep(this.workflow.steps, stepName);
    if (step === undefined) {
      throw new Error(`step: ${stepName} does not exist`);
    }
    if (subStepName && step.type === StepType.Workflow) {
      step = this.findStep((step as WorkflowStepInternal).steps, subStepName);
      if (step === undefined) {
        throw new Error(`step: ${stepName} with subStep: ${subStepName} does not exist`);
      }
    }
    return step;
  }

  executeStep(
    step: StepInternal,
    input: any,
    bindings: Record<string, any> = {},
  ): Promise<StepOutput> {
    return this.executeStepInternal(step, input, cloneDeep(bindings));
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
