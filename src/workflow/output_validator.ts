import { BatchStep, SimpleStep, Step, StepType, Workflow, WorkflowStep } from '../common';
import { WorkflowCreationError } from '../errors';

// Matches: $.outputs.stepName,
// Result: [$.outputs.stepName, stepName, stepName];
// Matches: $.outputs.workflow.step,
// Result: [$.outputs.workflow.step, workflow.step, workflow, .step, step];
const regexOutputReference = /\$\.?outputs\.((\w+)(\.(\w+))?)/g;

export class WorkflowOutputsValidator {
  private readonly workflow: Workflow;

  private readonly seenSteps: Set<string>;

  private readonly stepTypeMap: Map<string, StepType>;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
    this.seenSteps = new Set();
    this.stepTypeMap = new Map();
  }

  validateWorkflowOutputReference(match: RegExpMatchArray, stepName: string, parentName?: string) {
    const workflowName = match[2]; // The name of the workflow step
    // Access to the child step outputs is restricted to within the same parent workflow step;
    if (parentName !== workflowName) {
      throw new WorkflowCreationError(
        `Invalid output reference: ${match[0]}, step is not a child of ${parentName}`,
        this.workflow.name,
        parentName,
        stepName,
      );
    }
  }

  validateExistanceOfOutputReference(
    match: RegExpMatchArray,
    stepName: string,
    parentName?: string,
  ) {
    const fullOutputName = match[1]; // For workflow step
    const outputStepName = match[2]; // For simple step
    // Check the referenced step output is already executed.
    if (!this.seenSteps.has(fullOutputName) && !this.seenSteps.has(outputStepName)) {
      throw new WorkflowCreationError(
        `Invalid output reference: ${match[0]}, step is not executed yet.`,
        this.workflow.name,
        parentName ?? stepName,
        parentName ? stepName : undefined,
      );
    }
  }

  validateOutputReferences(stepName: string, template?: string, parentName?: string) {
    if (!template) {
      return;
    }
    const outputMatches = [...template.matchAll(regexOutputReference)];

    // Multiple outputs may exist within the template so we need a loop.
    // In this case, we are looking for workflow step output references.
    // Format: $.outputs.workflowStepName.ChildStepName
    for (const match of outputMatches) {
      const primaryStepName = match[2]; // The name of the step
      const ChildStepName = match[4]; // The name of the child step
      if (this.stepTypeMap.get(primaryStepName) === StepType.Workflow && ChildStepName) {
        this.validateWorkflowOutputReference(match, stepName, parentName);
      }
      this.validateExistanceOfOutputReference(match, stepName, parentName);
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
      const stepType = step.type as StepType;
      this.stepTypeMap.set(stepName, stepType);
      let outputName = stepName;
      this.validateCommonStepParams(step, parentName);
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
      if (parentName) {
        outputName = `${parentName}.${stepName}`;
      }
      this.seenSteps.add(outputName);
    }
  }

  validateOutputs() {
    const { steps: workflowSteps } = this.workflow;
    this.validateSteps(workflowSteps);
  }
}
