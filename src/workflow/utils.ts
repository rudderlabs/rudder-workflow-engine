import { pick } from 'lodash';
import path from 'path';
import yaml from 'yaml';
import { toArray } from '../bindings/common';
import {
  Binding,
  CommonUtils,
  SimpleStep,
  Step,
  StepType,
  Workflow,
  WorkflowBindingProvider,
  WorkflowExecutor,
  WorkflowOptionsInternal,
  WorkflowStep,
} from '../common';
import { BindingNotFoundError, WorkflowCreationError } from '../errors';
import { DefaultWorkflowExecutor } from './default_executor';

const regexSimpleOutput = /\$\.?outputs\.(\w+)/g;
const regexWorkflowOutput = /\$\.?outputs\.(\w+)\.(\w+)/g;

export class WorkflowUtils {
  private static populateWorkflowName(workflow: Workflow, workflowPath: string) {
    if (!workflow.name) {
      const { name } = path.parse(workflowPath);
      // eslint-disable-next-line no-param-reassign
      workflow.name = name;
    }
  }

  static async createWorkflowFromFilePath(yamlPath: string): Promise<Workflow> {
    const workflow = (await this.createFromFilePath<Workflow>(yamlPath)) || {};
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

  static validateOutputs(workflow: Workflow) {
    const { steps: workflowSteps } = workflow;
    const seenSteps = new Set(); // Set to track executed steps

    function validateOutputReferences(stepName: string, template?: string, parentName?: string) {
      if (!template) {
        return;
      }
      let match: RegExpExecArray | null;

      // eslint-disable-next-line no-cond-assign
      while ((match = regexWorkflowOutput.exec(template)) !== null) {
        const workflowName = match[1];
        if (parentName !== workflowName) {
          throw new WorkflowCreationError(
            `Invalid output reference: ${match[0]}, step is not a child of ${parentName}`,
            workflow.name,
            parentName,
            stepName,
          );
        }
        const outputName = `${workflowName}.${match[2]}`;
        if (!seenSteps.has(outputName)) {
          throw new WorkflowCreationError(
            `Invalid output reference: ${match[0]}`,
            workflow.name,
            parentName,
            stepName,
          );
        }
      }

      // eslint-disable-next-line no-cond-assign
      while ((match = regexSimpleOutput.exec(template)) !== null) {
        const outputStepName = match[1];
        if (!seenSteps.has(outputStepName)) {
          throw new WorkflowCreationError(
            `Invalid output reference: ${match[0]}`,
            workflow.name,
            parentName ?? stepName,
            parentName ? stepName : undefined,
          );
        }
      }
    }

    function validateSteps(steps: Step[], parentName?: string) {
      for (const step of steps) {
        const stepName = step.name;
        let outputName = stepName;
        if (parentName) {
          seenSteps.add(parentName);
          outputName = `${parentName}.${stepName}`;
        }
        seenSteps.add(outputName);

        if (step.type === StepType.Workflow) {
          const workflowStep = step as WorkflowStep;
          if (workflowStep.steps) {
            validateSteps(workflowStep.steps, stepName);
          }
        }
        if (step.else) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          validateElseStep(step.else, parentName);
        }
        if (step.type === StepType.Simple) {
          const simpleStep = step as SimpleStep;
          validateOutputReferences(stepName, simpleStep.template, parentName);
        }
        validateOutputReferences(stepName, step.condition, parentName);
      }
    }

    function validateElseStep(step: Step, parentName?: string) {
      if (step.type === StepType.Simple) {
        const simpleStep = step as SimpleStep;
        validateOutputReferences(step.name, simpleStep.template, parentName);
      } else if (step.type === StepType.Workflow) {
        const workflowStep = step as WorkflowStep;
        if (workflowStep.steps?.length) {
          validateSteps(workflowStep.steps, step.name);
        }
      }
    }

    validateSteps(workflowSteps);
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
      bidningPath || 'bindings',
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
