import yaml from 'js-yaml';
import { readFile } from 'fs/promises';
import path from 'path';
import { Dictionary } from '../common/types';
import { WorkflowCreationError } from './errors';
import { Binding, ParentBinding, PathBinding, ValueBinding, Workflow } from './types';

export class WorkflowUtils {
  private static populateWorkflowName(workflow: Workflow, workflowPath: string) {
    if (!workflow.name) {
      const { name } = path.parse(workflowPath);
      workflow.name = name;
    }
  }

  static async createWorkflowFromFilePath(yamlPath: string): Promise<Workflow> {
    const workflow = (await this.createFromFilePath<Workflow>(yamlPath)) || {};
    this.populateWorkflowName(workflow, yamlPath);
    return workflow;
  }

  static async createFromFilePath<T>(yamlPath: string): Promise<T> {
    const yamlString = await readFile(yamlPath, { encoding: 'utf-8' });
    return this.createFromYaml<T>(yamlString);
  }

  static createFromYaml<T>(yamlString: string): T {
    return yaml.load(yamlString) as T;
  }

  static validateWorkflow(workflow: Workflow) {
    if (!workflow?.steps?.length) {
      throw new WorkflowCreationError('Workflow should contain at least one step', workflow.name);
    }
  }

  private static async getModuleExports(
    modulePath: string,
    throwError: boolean = false,
  ): Promise<any> {
    try {
      return await import(modulePath);
    } catch (error: any) {
      if (throwError) {
        throw error;
      }
    }
  }

  static async extractBindingsFromPaths(
    rootPath: string,
    bindingsPaths?: string[],
  ): Promise<Dictionary<any>> {
    if (!bindingsPaths?.length) {
      return {};
    }

    const bindings = await Promise.all(
      bindingsPaths.map(async (bindingPath) => {
        return (
          (await this.getModuleExports(bindingPath)) ||
          this.getModuleExports(path.join(rootPath, bindingPath), true)
        );
      }),
    );
    return Object.assign({}, ...bindings);
  }

  static async extractBindings(
    rootPath: string,
    bindings: Binding[] = [],
    parentBindings: Dictionary<any> = {},
  ): Promise<Dictionary<any>> {
    if (!bindings.length) {
      return {};
    }
    let bindingsObj: Record<string, any> = {};
    for (const binding of bindings) {
      const parentBinding = binding as ParentBinding;
      if (parentBinding.fromParent) {
        bindingsObj[parentBinding.name] = parentBindings[parentBinding.name];
        continue;
      }

      const valueBinding = binding as ValueBinding;
      if (valueBinding.value) {
        bindingsObj[valueBinding.name] = valueBinding.value;
        continue;
      }

      const pathBinding = binding as PathBinding;
      const bindingSource = await import(path.join(rootPath, pathBinding.path || 'bindings'));
      if (pathBinding.name) {
        bindingsObj[pathBinding.name] = pathBinding.exportAll
          ? bindingSource
          : bindingSource[pathBinding.name];
      } else {
        bindingsObj = Object.assign(bindingsObj, bindingSource);
      }
    }
    return bindingsObj;
  }
}
