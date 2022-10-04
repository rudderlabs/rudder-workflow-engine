import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import path from 'path';
import jsonata from 'jsonata';
import { Workflow, Binding, Dictionary } from './types';
import { StatusError, WorkflowCreationError } from './errors';
import { StepType } from './steps/types';
import { StepUtils } from './steps/utils';
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

  static validateWorkflow(workflow: Workflow) {
    if (!workflow?.name) {
      throw new Error('Workflow should have a name');
    }
    if (!workflow?.steps?.length) {
      throw new WorkflowCreationError('Workflow should contain at least one step', workflow.name);
    }
    for (let i = 0; i < workflow.steps.length; i++) {
      StepUtils.validateStep(workflow.steps[i], i);
    }
  }

  static populateStepType(workflow: Workflow) {
    for (const step of workflow.steps) {
      step.type = StepUtils.getStepType(step);
      if (step.type === StepType.Unknown) {
        throw new WorkflowCreationError('Invalid step', workflow.name, step.name);
      }
    }
  }

  private static getModuleExports(modulePath: string, logError: boolean = false): any {
    try {
      return require(modulePath);
    } catch (error: any) {
      if (logError) {
        console.error(error);
      }
    }
  }

  static extractBindingsFromPaths(rootPath: string, bindingsPaths?: string[]): Dictionary<any> {
    if (!bindingsPaths?.length) {
      return {};
    }

    const bindings = bindingsPaths.map((bindingPath) => {
      return (
        this.getModuleExports(path.join(rootPath, bindingPath)) ||
        this.getModuleExports(bindingPath, true) ||
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

  static getErrorStatus(error: any) {
    return error.response?.status || error.status || 500;
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
          if (WorkflowUtils.isAssertError(error)) {
            return reject(new StatusError(error.message, 400));
          }
          return reject(error);
        }
        resolve(response);
      });
    });
  }
}
