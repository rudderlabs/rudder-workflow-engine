import { readFileSync } from 'fs';
import cloneDeep from 'lodash/cloneDeep';
import { join } from 'path';
import { WorkflowOutput, WorkflowEngineFactory, WorkflowEngine } from '../../src';
import { Sceanario, SceanarioType } from '../types';

export class SceanarioUtils {
  static createWorkflowEngine(scenarioDir: string, sceanario: Sceanario) {
    const workflowPath = join(scenarioDir, sceanario.workflowPath || 'workflow.yaml');
    return WorkflowEngineFactory.createFromFilePath(
      workflowPath,
      scenarioDir,
      sceanario.bindingsPaths,
    );
  }

  static createWorkflowEngineAsync(
    scenarioDir: string,
    sceanario: Sceanario,
  ): Promise<WorkflowEngine> {
    const workflowPath = join(scenarioDir, sceanario.workflowPath || 'workflow.yaml');
    return WorkflowEngineFactory.createFromFilePathAsync(
      workflowPath,
      scenarioDir,
      sceanario.bindingsPaths,
    );
  }

  static async executeWorkflow(
    workflowEngine: WorkflowEngine,
    input: any,
  ): Promise<WorkflowOutput> {
    let result = await workflowEngine.execute(input);
    // JSONata creates immutable arrays and it cause issues
    // so doing the following makes the comparison successful.
    result = JSON.parse(JSON.stringify(result));
    return { output: result.output };
  }

  static extractScenarios(scenarioDir: string): Sceanario[] {
    const scenariosJSON = readFileSync(join(scenarioDir, 'data.json'), { encoding: 'utf-8' });
    const scenarios: Sceanario[] = JSON.parse(scenariosJSON);
    scenarios.forEach((scenario, index) => {
      scenario.index = index;
      scenario.type = SceanarioType.Sync;
    });
    const asyncScenarios = scenarios.map((scenario) => {
      const newScenario: Sceanario = cloneDeep(scenario);
      scenario.type = SceanarioType.Async;
      return newScenario;
    });
    return scenarios.concat(asyncScenarios);
  }
}
