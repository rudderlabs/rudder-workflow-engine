import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import jsonata from 'jsonata';
import { isEmpty } from 'lodash';
import {
  SimpleStep,
  Step,
  WorkflowStep,
  StepExitAction,
  Workflow,
  Binding,
  StepType,
  StepInternal,
  StepInternalCommon,
  Dictionary,
  SimpleStepInternal,
} from './types';
import { CustomError } from './errors';
import { SimpleStepExecutor } from './steps/simple-step';
import { WorkflowStepExecutor } from './steps/workflow-step';

export type GetStepInternalParams = {
  step: SimpleStep;
  stepType: StepType;
  rootPath: string;
  bindings?: Dictionary<any>;
};
export class WorkflowUtils {
  static createFromFilePath<T>(workflowYamlPath: string): T {
    const workflowYaml = readFileSync(workflowYamlPath, { encoding: 'utf-8' });
    return yaml.load(workflowYaml) as T;
  }

  static getContextFunctions(context: Record<string, any> = {}) {
    return {
      setContext: (key, value) => {
        context[key] = value;
      },
    };
  }

  static shouldSkipStep(
    step: StepInternal,
    input: any,
    bindings: Record<string, any> = {},
  ): boolean {
    return !!step.conditionExpression && !step.conditionExpression.evaluate(input, bindings);
  }

  static getStepInternal(params: GetStepInternalParams): StepInternal | undefined {
    const { stepType, step, rootPath, bindings } = params;
    let stepInternal: StepInternal = {} as StepInternal;
    // can this be placed here ?
    if (step.inputTemplate) {
      stepInternal.inputTemplateExpression = jsonata(step.inputTemplate);
    }
    if (stepType === StepType.Simple) {
      stepInternal = new SimpleStepExecutor(step.name, rootPath);
    } else if (stepType === StepType.Workflow) {
      stepInternal = new WorkflowStepExecutor(step.name, rootPath);
    } else {
      // Invalid workflow configuration has been provided
      return;
    }

    const isNotEmpty = !isEmpty(stepInternal);
    if (isNotEmpty) {
      for (let prop in step) {
        stepInternal[prop] = step[prop];
      }
      stepInternal.init(step, bindings);
      return stepInternal;
    }

    // Invalid workflow configuration has been provided
    return;
  }

  static createFromYaml(workflowYaml: string): Workflow {
    return yaml.load(workflowYaml) as Workflow;
  }

  static isSimpleStep(step: Step): boolean {
    try {
      const simpleStep = step as SimpleStep;
      return (
        !!simpleStep.template ||
        !!simpleStep.templatePath ||
        !!simpleStep.functionName ||
        !!simpleStep.externalWorkflow
      );
    } catch {
      return false;
    }
  }

  static isWorkflowStep(step: Step): boolean {
    try {
      const workflowStep = step as WorkflowStep;
      return !!workflowStep.steps?.length || !!workflowStep.workflowStepPath;
    } catch {
      return false;
    }
  }

  static validateWorkflow(workflow: Workflow) {
    if (!workflow || !workflow.steps || workflow.steps.length === 0) {
      throw new CustomError('Workflow should contain at least one step', 400);
    }
    for (const step of workflow.steps) {
      WorkflowUtils.validateStep(step);
    }
  }

  static validateStep(step: Step) {
    if (!step.name) {
      throw new CustomError('step should have a name', 400);
    }
    if (step.onComplete === StepExitAction.Return && !step.condition) {
      throw new CustomError(
        '"onComplete = return" should be used in a step with condition',
        400,
        step.name,
      );
    }
  }

  static getStepType(step: Step): StepType {
    if (WorkflowUtils.isWorkflowStep(step)) {
      return StepType.Workflow;
    }
    if (WorkflowUtils.isSimpleStep(step)) {
      return StepType.Simple;
    }
    throw new CustomError('Invalid step', 400, step.name);
  }

  static extractBindings(rootPath: string, bindings?: Binding[]): Record<string, any> {
    if (!bindings?.length) {
      return {};
    }
    let bindingsObj: Record<string, any> = {};
    for (const binding of bindings) {
      const bindingSource = require(join(rootPath, binding.path || 'bindings'));
      if (binding.name) {
        bindingsObj[binding.name] = binding.exportAll ? bindingSource : bindingSource[binding.name];
      } else {
        bindingsObj = Object.assign(bindingsObj, bindingSource);
      }
    }
    return bindingsObj;
  }

  static isAssertError(error: any) {
    return error.token === 'assert';
  }

  static jsonataPromise(
    expr: jsonata.Expression,
    data: any,
    bindings: Record<string, any>,
  ): Promise<any> {
    return new Promise(function (resolve, reject) {
      expr.evaluate(data, bindings, function (error, response) {
        if (error) {
          const anyError = error as any;
          if (anyError.result) {
            return resolve(anyError.result);
          }
          return reject(error);
        }
        resolve(response);
      });
    });
  }
}
