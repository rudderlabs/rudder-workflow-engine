import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import path from 'path';
import jsonata from 'jsonata';
import { Workflow, Binding, Dictionary } from './types';
import { StatusError, StepCreationError, WorkflowCreationError } from './errors';
import { SimpleStep, StepType, Step, WorkflowStep, StepExitAction } from './steps/types';

export type GetStepInternalParams = {
  step: SimpleStep;
  stepType: StepType;
  rootPath: string;
  bindings?: Dictionary<any>;
};
export class WorkflowUtils {
  static createWorkflowFromFilePath(yamlPath: string): Workflow {
    const workflow = this.createFromFilePath<Workflow>(yamlPath) || {};
    if (!workflow.name) {
      const { name } = path.parse(yamlPath);
      workflow.name = name;
    }
    return workflow;
  }

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
    if (!workflow?.name) {
      throw new Error('Workflow should have a name');
    }
    if (!workflow?.steps?.length) {
      throw new WorkflowCreationError('Workflow should contain at least one step', workflow.name);
    }
    for (let i = 0; i < workflow.steps.length; i++) {
      WorkflowUtils.validateStep(workflow, workflow.steps[i], i);
    }
  }

  private static validateStep(workflow: Workflow, step: Step, index: number) {
    if (!step.name) {
      throw new WorkflowCreationError(`step#${index} should have a name`, workflow.name);
    }

    if (step.onComplete === StepExitAction.Return && !step.condition) {
      throw new WorkflowCreationError(
        '"onComplete = return" should be used in a step with condition',
        workflow.name,
        step.name,
      );
    }
  }

  static populateStepType(workflow: Workflow) {
    for (const step of workflow.steps) {
      step.type = WorkflowUtils.getStepType(step);
      if (step.type === StepType.Unknown) {
        throw new WorkflowCreationError('Invalid step', workflow.name, step.name);
      }
    }
  }

  static getStepType(step: Step): StepType {
    if (WorkflowUtils.isWorkflowStep(step)) {
      return StepType.Workflow;
    }
    if (WorkflowUtils.isSimpleStep(step)) {
      return StepType.Simple;
    }
    return StepType.Unknown;
  }

  static getModuleExports(modulePath: string): any {
    try {
      return require(modulePath);
    } catch (error: any) {
      console.error(error);
    }
  }

  static extractBindingsFromPaths(rootPath: string, bindingsPaths?: string[]): Dictionary<any> {
    if (!bindingsPaths || !bindingsPaths.length) {
      return {};
    }

    const bindings = bindingsPaths.map((bindingPath) => {
      return (
        WorkflowUtils.getModuleExports(path.join(rootPath, bindingPath)) ||
        WorkflowUtils.getModuleExports(path.join(bindingPath)) ||
        {}
      );
    });
    return Object.assign({}, ...bindings);
  }

  static extractBindings(rootPath: string, bindings?: Binding[]): Dictionary<any> {
    if (!bindings?.length) {
      return {};
    }
    let bindingsObj: Record<string, any> = {};
    for (const binding of bindings) {
      const bindingSource = require(path.join(rootPath, binding.path || 'bindings'));
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
