import { readFileSync } from 'fs';
import { join } from 'path';
import {
  WorkflowEngineFactory,
  WorkflowEngine,
  Executor,
  TemplateType,
  WorkflowOptions,
} from '../../src';
import { Scenario } from '../types';

export class ScenarioUtils {
  static createWorkflowEngine(scenarioDir: string, scenario: Scenario): Promise<WorkflowEngine> {
    const workflowPath = join(scenarioDir, scenario.workflowPath || 'workflow.yaml');
    const defaultOptions: WorkflowOptions = {
      rootPath: scenarioDir,
      templateType: TemplateType.JSONATA,
    };
    scenario.options = Object.assign({}, defaultOptions, scenario.options);
    return WorkflowEngineFactory.createFromFilePath(workflowPath, scenario.options);
  }

  private static async execute(executor: Executor, scenario: Scenario): Promise<any> {
    let result = await executor.execute(scenario.input);
    return { output: result.output };
  }

  static executeScenario(workflowEngine: WorkflowEngine, scenario: Scenario) {
    let executor: Executor = workflowEngine;
    if (scenario.stepName) {
      executor = workflowEngine.getStepExecutor(scenario.stepName, scenario.childStepName);
    }
    return this.execute(executor, scenario);
  }

  static extractScenarios(scenarioDir: string): Scenario[] {
    const scenariosJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
    return JSON.parse(scenariosJSON) as Scenario[];
  }
}
