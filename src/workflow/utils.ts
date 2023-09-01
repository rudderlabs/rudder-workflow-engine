import yaml from 'js-yaml';
import { readFile } from 'fs/promises';
import path from 'path';
import { WorkflowCreationError } from './errors';
import {
  Binding,
  ParentBinding,
  PathBinding,
  ValueBinding,
  Workflow,
  WorkflowBindingProvider,
  WorkflowExecutor,
  WorkflowOptionsInternal,
} from './types';
import { DefaultWorkflowExecutor } from './default_executor';

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

  private static async getModuleExportsFromProvider(
    modulePath: string,
    provider: WorkflowBindingProvider,
  ): Promise<any> {
    try {
      return await provider.provide(modulePath);
    } catch (error: any) {
      // Ignoring error
    }
  }

  private static async getModuleExportsFromAllPaths(
    bindingPath: string,
    options: WorkflowOptionsInternal,
  ): Promise<any> {
    return (
      (options.bindingProvider
        ? await this.getModuleExportsFromProvider(bindingPath, options.bindingProvider)
        : await this.getModuleExports(bindingPath)) ??
      (await this.getModuleExports(path.join(options.rootPath, bindingPath), true))
    );
  }

  static async extractBindingsFromPaths(
    options: WorkflowOptionsInternal,
  ): Promise<Record<string, any>> {
    if (!options.bindingsPaths?.length) {
      return {};
    }

    const bindings = await Promise.all(
      options.bindingsPaths.map(async (bindingPath) => {
        return this.getModuleExportsFromAllPaths(bindingPath, options);
      }),
    );
    return Object.assign({}, ...bindings);
  }

  static async extractBindings(
    bindings: Binding[] = [],
    options: WorkflowOptionsInternal,
  ): Promise<Record<string, any>> {
    let bindingsObj: Record<string, any> = {};
    if (!bindings.length) {
      return bindingsObj;
    }
    const parentBindings = options.parentBindings || {};
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
      const bindingSource = await this.getModuleExportsFromAllPaths(
        pathBinding.path || 'bindings',
        options,
      );
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

  static async getExecutor(
    workflow: Workflow,
    options: WorkflowOptionsInternal,
  ): Promise<WorkflowExecutor> {
    if (workflow?.executor) {
      let executor = options.currentBindings[workflow.executor] as WorkflowExecutor;
      if (!executor?.execute) {
        throw new WorkflowCreationError('Workflow executor not found', workflow.executor);
      }
      return executor;
    }
    return options.executor || DefaultWorkflowExecutor.INSTANCE;
  }
}
