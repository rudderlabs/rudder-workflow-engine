import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import jsonata from 'jsonata';
import { Workflow, Binding, Dictionary } from './types';
import { WorkflowEngineError } from './errors';
import { SimpleStep, StepType, Step, WorkflowStep, StepExitAction } from './steps/types';

export type GetStepInternalParams = {
  step: SimpleStep;
  stepType: StepType;
  rootPath: string;
  bindings?: Dictionary<any>;
};
export class WorkflowUtils {
  static createFromFilePath<T>(yamlPath: string): T {
    const yamlString = readFileSync(yamlPath, { encoding: 'utf-8' });
    return yaml.load(yamlString) as T;
  }

  static createFromYaml<T>(yamlString: string): T {
    return yaml.load(yamlString) as T;
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
      throw new WorkflowEngineError('Workflow should contain at least one step', 400);
    }
    for (const step of workflow.steps) {
      WorkflowUtils.validateStep(step);
    }
  }

  static validateStep(step: Step) {
    if (!step.name) {
      throw new WorkflowEngineError('step should have a name', 400);
    }

    if (step.onComplete === StepExitAction.Return && !step.condition) {
      throw new WorkflowEngineError(
        '"onComplete = return" should be used in a step with condition',
        400,
        step.name,
      );
    }
  }

  static populateStepType(workflow: Workflow) {
    for (const step of workflow.steps) {
      step.type = WorkflowUtils.getStepType(step);
    }
  }

  static getStepType(step: Step): StepType {
    if (WorkflowUtils.isWorkflowStep(step)) {
      return StepType.Workflow;
    }
    if (WorkflowUtils.isSimpleStep(step)) {
      return StepType.Simple;
    }
    throw new WorkflowEngineError('Invalid step', 400, step.name);
  }

  static extractBindingsFromPaths(rootPath: string, bindingsPaths?: string[]): Dictionary<any> {
    if (!bindingsPaths || !bindingsPaths.length) {
      return {};
    }

    const bindings = bindingsPaths.map((bindingPath) => {
      try {
        return require(join(rootPath, bindingPath));
      } catch {
        return require(bindingPath);
      }
    });
    return Object.assign({}, ...bindings);
  }

  static extractBindings(rootPath: string, bindings?: Binding[]): Dictionary<any> {
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
          if (error.token === 'doReturn') {
            return resolve((error as any).result);
          }
          return reject(error);
        }
        resolve(response);
      });
    });
  }
}
