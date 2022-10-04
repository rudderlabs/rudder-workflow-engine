import { StepCreationError } from './errors';
import { SimpleStep, Step, StepExitAction, StepType, WorkflowStep } from './types';

export class StepUtils {
    static getStepType(step: Step): StepType {
        if (StepUtils.isWorkflowStep(step)) {
            return StepType.Workflow;
        }
        if (StepUtils.isSimpleStep(step)) {
            return StepType.Simple;
        }
        return StepType.Unknown;
    }

    static isWorkflowStep(step: WorkflowStep): boolean {
        return !!step.steps?.length || !!step.workflowStepPath;
    }

    static isSimpleStep(step: SimpleStep): boolean {
        return (
            !!step.template ||
            !!step.templatePath ||
            !!step.functionName ||
            !!step.externalWorkflow
        );
    }

    static validateStep(step: Step, index: number) {
        if (!step.name) {
            throw new StepCreationError(`step#${index} should have a name`);
        }

        if (step.onComplete === StepExitAction.Return && !step.condition) {
            throw new StepCreationError(
                '"onComplete = return" should be used in a step with condition',
                step.name,
            );
        }
    }
}
