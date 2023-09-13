import { readFileSync, existsSync } from 'fs';
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
      executor = workflowEngine.getStepExecutor(scenario.stepName);
    }
    return this.execute(executor, scenario);
  }

  static extractScenariosJSON(scenarioDir: string): Scenario[] {
    try {
      const scenariosJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
      return JSON.parse(scenariosJSON) as Scenario[];
    } catch (e) {
      console.error(scenarioDir, e);
      throw e;
    }
  }

  static extractScenarios(scenarioDir: string): Scenario[] {
    if (existsSync(join(scenarioDir, 'data.json'))) {
      return this.extractScenariosJSON(scenarioDir);
    }
    const { data } = require(join(scenarioDir, 'data.ts'));
    return data as Scenario[];
  }
}
