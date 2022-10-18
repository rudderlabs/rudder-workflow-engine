import { readFileSync } from 'fs';
import { join } from 'path';
import { WorkflowEngineFactory, WorkflowEngine, Executor } from '../../src';
import { Sceanario } from '../types';

export class SceanarioUtils {
  static createWorkflowEngine(scenarioDir: string, sceanario: Sceanario): Promise<WorkflowEngine> {
    const workflowPath = join(scenarioDir, sceanario.workflowPath || 'workflow.yaml');
    return WorkflowEngineFactory.createFromFilePath(
      workflowPath,
      scenarioDir,
      sceanario.bindingsPaths,
    );
  }

  private static async execute(executor: Executor, sceanario: Sceanario): Promise<any> {
    let result = await executor.execute(sceanario.input, sceanario.bindings);
    return { output: result.output };
  }

  static executeScenario(workflowEngine: WorkflowEngine, sceanario: Sceanario) {
    let executor: Executor = workflowEngine;
    if (sceanario.stepName) {
      executor = workflowEngine.getStepExecutor(sceanario.stepName, sceanario.childStepName);
    }
    return this.execute(executor, sceanario);
  }

  static extractScenarios(scenarioDir: string): Sceanario[] {
    const scenariosJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
    return JSON.parse(scenariosJSON) as Sceanario[];
  }
}
