import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { isEmpty } from 'lodash';
import jsonata from 'jsonata';
import { SimpleStep, Step, WorkflowStep, Workflow } from './types';
import { readFile } from 'fs/promises';

export class WorkflowUtils {
  // Ref: https://github.com/rudderlabs/rudder-transformer-cdk/pull/50#discussion_r882441319
  // TODO: should we make this async ? & also remove the above comment
  static async createFromFilePath(workflowYamlPath: string): Promise<Workflow> {
    const workflowYaml = await readFile(workflowYamlPath, { encoding: 'utf-8' });
    return yaml.load(workflowYaml) as Workflow;
  }

  static createFromYaml(workflowYaml: string): Workflow {
    return yaml.load(workflowYaml) as Workflow;
  }

  static isSimpleStep(step: Step): boolean {
    try {
      const simpleStep = step as SimpleStep;
      return (
        simpleStep.template !== undefined ||
        simpleStep.templatePath !== undefined ||
        simpleStep.functionName !== undefined ||
        simpleStep.externalWorkflow !== undefined
      );
    } catch {
      return false;
    }
  }

  /**
   * Mutually exclusive condition
   * Ref: https://www.howtocreate.co.uk/xor.html
   *
   * @param cond1
   * @param cond2
   * @returns
   */
  static xor(cond1: boolean, cond2: boolean) {
    return Boolean((cond1 ? 1 : 0) ^ (cond2 ? 1 : 0));
  }

  static isWorkflowStep(step: Step): boolean {
    try {
      const workflowStep = step as WorkflowStep;
      const isStepsPresent = Array.isArray(workflowStep.steps) && !isEmpty(workflowStep.steps);
      const isWorkflowPathPresent = workflowStep.workflowPath !== undefined;
      return WorkflowUtils.xor(isStepsPresent, isWorkflowPathPresent);
    } catch {
      return false;
    }
  }

  static isAssertError(error: any) {
    return error.token === 'assert';
  }

  static jsonataPromise(
    expr: jsonata.Expression,
    data: any,
    bindings: Record<string, any>,
  ): Promise<any> {
    return new Promise(function (resolve, reject) {
      expr.evaluate(data, bindings, function (error, response) {
        if (error) {
          const anyError = error as any;
          if (anyError.result) {
            return resolve(anyError.result);
          }
          return reject(error);
        }
        resolve(response);
      });
    });
  }
}
