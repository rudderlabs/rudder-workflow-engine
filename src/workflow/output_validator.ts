import { BatchStep, SimpleStep, Step, StepType, Workflow, WorkflowStep } from '../common';
import { WorkflowCreationError } from '../errors';

const regexSimpleOutput = /\$\.?outputs\.(\w+)/g;
const regexWorkflowOutput = /\$\.?outputs\.(\w+)\.(\w+)/g;

export class WorkflowOutputsValidator {
  private readonly workflow: Workflow;

  private readonly seenSteps: Set<string>;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
    this.seenSteps = new Set();
  }

  validateOutputReferences(stepName: string, template?: string, parentName?: string) {
    if (!template) {
      return;
    }
    const workflowOutputMatches = [...template.matchAll(regexWorkflowOutput)];

    // Multiple outputs may exist within the template so we need a loop.
    // In this case, we are looking for workflow step output references.
    // Format: $.outputs.workflowStepName.ChildStepName
    // eslint-disable-next-line no-cond-assign
    for (const match of workflowOutputMatches) {
      const workflowName = match[1];
      // Access to the child step outputs is restricted to within the same parent workflow step;
      if (parentName !== workflowName) {
        throw new WorkflowCreationError(
          `Invalid output reference: ${match[0]}, step is not a child of ${parentName}`,
          this.workflow.name,
          parentName,
          stepName,
        );
      }
      const outputName = `${workflowName}.${match[2]}`;
      // The referenced child step output is already executed.
      if (!this.seenSteps.has(outputName)) {
        throw new WorkflowCreationError(
          `Invalid output reference: ${match[0]}`,
          this.workflow.name,
          parentName,
          stepName,
        );
      }
    }
    const simpleOutputMatches = [...template.matchAll(regexSimpleOutput)];
    // Multiple outputs may exist within the template so we need a loop.
    // In this case, we are looking for simple step output references.
    // Format: $.outputs.stepName
    // Example template: $.outputs.stepName1 + " " + $.outputs.stepName2
    // eslint-disable-next-line no-cond-assign
    for (const match of simpleOutputMatches) {
      const outputStepName = match[1];
      // The referenced step output is already executed.
      if (!this.seenSteps.has(outputStepName)) {
        throw new WorkflowCreationError(
          `Invalid output reference: ${match[0]}`,
          this.workflow.name,
          parentName ?? stepName,
          parentName ? stepName : undefined,
        );
      }
    }
  }

  validateCommonStepParams(step: Step, parentName?: string) {
    this.validateOutputReferences(step.name, step.condition, parentName);
    this.validateOutputReferences(step.name, step.inputTemplate, parentName);
    this.validateOutputReferences(step.name, step.loopCondition, parentName);
    if (step.else) {
      this.validateSteps([step.else], parentName);
    }
  }

  validateBatchStep(step: BatchStep, parentName?: string) {
    if (step.batches) {
      for (const batch of step.batches) {
        this.validateOutputReferences(step.name, batch.filter, parentName);
        this.validateOutputReferences(step.name, batch.map, parentName);
      }
    }
  }

  validateSteps(steps: Step[], parentName?: string) {
    for (const step of steps) {
      const stepName = step.name;
      let outputName = stepName;
      if (parentName) {
        this.seenSteps.add(parentName);
        outputName = `${parentName}.${stepName}`;
      }

      this.validateCommonStepParams(step, parentName);
      this.seenSteps.add(outputName);

      if (step.type === StepType.Workflow) {
        const workflowStep = step as WorkflowStep;
        if (workflowStep.steps) {
          this.validateSteps(workflowStep.steps, stepName);
        }
      } else if (step.type === StepType.Simple) {
        this.validateOutputReferences(stepName, (step as SimpleStep).template, parentName);
      } else if (step.type === StepType.Batch) {
        this.validateBatchStep(step as BatchStep, parentName);
      }
    }
  }

  validateOutputs() {
    const { steps: workflowSteps } = this.workflow;
    this.validateSteps(workflowSteps);
  }
}
