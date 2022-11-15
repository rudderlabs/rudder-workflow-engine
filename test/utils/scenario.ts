import { readFileSync } from 'fs';
import { join } from 'path';
import { WorkflowEngineFactory, WorkflowEngine, Executor } from '../../src';
import { Scenario } from '../types';

export class ScenarioUtils {
  static createWorkflowEngine(scenarioDir: string, sceanario: Scenario): Promise<WorkflowEngine> {
    const workflowPath = join(scenarioDir, sceanario.workflowPath || 'workflow.yaml');
    return WorkflowEngineFactory.createFromFilePath(
      workflowPath,
      scenarioDir,
      sceanario.bindingsPaths,
    );
  }

  private static async execute(executor: Executor, sceanario: Scenario): Promise<any> {
    let result = await executor.execute(sceanario.input, sceanario.bindings);
    return { output: result.output };
  }

  static executeScenario(workflowEngine: WorkflowEngine, sceanario: Scenario) {
    let executor: Executor = workflowEngine;
    if (sceanario.stepName) {
      executor = workflowEngine.getStepExecutor(sceanario.stepName, sceanario.childStepName);
    }
    return this.execute(executor, sceanario);
  }

  static extractScenarios(scenarioDir: string): Scenario[] {
    const scenariosJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
    return JSON.parse(scenariosJSON) as Scenario[];
  }
}
