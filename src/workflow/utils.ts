import { pick } from 'lodash';
import path from 'path';
import yaml from 'yaml';
import { toArray } from '../bindings/common';
import {
  Binding,
  CommonUtils,
  Workflow,
  WorkflowBindingProvider,
  WorkflowExecutor,
  WorkflowOptionsInternal,
} from '../common';
import { BindingNotFoundError, WorkflowCreationError } from '../errors';
import { DefaultWorkflowExecutor } from './default_executor';
import { WorkflowOutputsValidator } from './output_validator';

export class WorkflowUtils {
  private static populateWorkflowName(workflow: Workflow, workflowPath: string) {
    if (!workflow.name) {
      const { name } = path.parse(workflowPath);
      // eslint-disable-next-line no-param-reassign
      workflow.name = name;
    }
  }

  static async createWorkflowFromFilePath(yamlPath: string): Promise<Workflow> {
    const workflow = (await this.createFromFilePath<Workflow>(yamlPath)) ?? {};
    this.populateWorkflowName(workflow, yamlPath);
    return workflow;
  }

  static async createFromFilePath<T>(yamlPath: string): Promise<T> {
    const yamlString = await CommonUtils.readFile(yamlPath);
    return this.createFromYaml<T>(yamlString);
  }

  static createFromYaml<T>(yamlString: string): T {
    return yaml.parse(yamlString) as T;
  }

  static validateWorkflow(workflow: Workflow) {
    if (!workflow?.steps?.length) {
      throw new WorkflowCreationError('Workflow should contain at least one step', workflow.name);
    }
  }

  static validate(workflow: Workflow) {
    const validator = new WorkflowOutputsValidator(workflow);
    validator.validateOutputs();
  }

  private static async getModuleExports(modulePath: string): Promise<any> {
    let moduleExports;
    try {
      moduleExports = await import(modulePath);
    } catch (error: any) {
      // Ignore error
    }
    return moduleExports;
  }

  private static async getModuleExportsFromProvider(
    modulePath: string,
    provider: WorkflowBindingProvider,
  ): Promise<any> {
    let moduleExports;
    try {
      moduleExports = await provider.provide(modulePath);
    } catch (error: any) {
      // Ignore error
    }
    return moduleExports;
  }

  private static async getModuleExportsFromBindingsPath(bindingPath: string): Promise<any> {
    return (
      (await this.getModuleExports(bindingPath)) ??
      (await this.getModuleExports(path.join(process.cwd(), bindingPath)))
    );
  }

  private static async getModuleExportsFromAllPaths(
    bindingPath: string,
    options: WorkflowOptionsInternal,
  ): Promise<any> {
    const binding =
      (await this.getModuleExports(path.join(options.rootPath, bindingPath))) ??
      (options.bindingProvider
        ? await this.getModuleExportsFromProvider(bindingPath, options.bindingProvider)
        : await this.getModuleExportsFromBindingsPath(bindingPath));
    if (!binding) {
      throw new BindingNotFoundError(bindingPath);
    }
    return binding;
  }

  static async extractWorkflowOptionsBindings(
    options: WorkflowOptionsInternal,
  ): Promise<Record<string, any>> {
    if (!options.bindingsPaths?.length) {
      return {};
    }

    const bindings = await Promise.all(
      options.bindingsPaths.map(async (bindingPath) =>
        this.getModuleExportsFromAllPaths(bindingPath, options),
      ),
    );
    return Object.assign({}, ...bindings);
  }

  static async extractBinding(
    binding: Binding,
    options: WorkflowOptionsInternal,
  ): Promise<Record<string, any>> {
    const parentBindings = options.parentBindings ?? {};
    const { name, value, path: bidningPath, fromParent, exportAll } = binding as any;
    if (fromParent) {
      return { [name]: parentBindings[name] };
    }
    if (value) {
      return { [name]: value };
    }
    const bindingSource = await this.getModuleExportsFromAllPaths(
      bidningPath ?? 'bindings',
      options,
    );
    if (!name) {
      return bindingSource;
    }
    const names = toArray(name) as string[];
    if (names.length === 1) {
      return { [name]: exportAll ? bindingSource : bindingSource[name] };
    }
    return pick(bindingSource, names);
  }

  static async extractBindings(
    options: WorkflowOptionsInternal,
    bindings: Binding[] = [],
  ): Promise<Record<string, any>> {
    if (bindings.length === 0) {
      return {};
    }
    const bindingsData = await Promise.all(
      bindings.map(async (binding) => this.extractBinding(binding, options)),
    );
    return Object.assign({}, ...bindingsData);
  }

  static async getExecutor(
    workflow: Workflow,
    options: WorkflowOptionsInternal,
  ): Promise<WorkflowExecutor> {
    if (workflow?.executor) {
      const executor = options.currentBindings[workflow.executor] as WorkflowExecutor;
      if (typeof executor?.execute !== 'function') {
        throw new WorkflowCreationError('Workflow executor not found', workflow.executor);
      }
      return executor;
    }
    return options.executor ?? DefaultWorkflowExecutor.INSTANCE;
  }
}
