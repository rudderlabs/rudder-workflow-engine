import { join } from 'path';
import { Logger } from 'pino';
import { Dictionary } from '../../types';
import { WorkflowUtils } from '../../utils';
import { StepCreationError } from '../errors';
import { StepExecutorFactory } from '../factory';
import { SimpleStep, StepExecutor, StepType, WorkflowStep } from '../types';

export class BaseStepUtils {
    static async populateWorkflowStep(
        step: WorkflowStep,
        rootPath: string,
    ): Promise<WorkflowStep> {
        let newStep = step;
        if (step.workflowStepPath) {
            const workflowStepPath = join(rootPath, step.workflowStepPath);
            const workflowStepFromPath = await WorkflowUtils.createFromFilePath<WorkflowStep>(
                workflowStepPath,
            );
            newStep = Object.assign({}, workflowStepFromPath, step);
        }
        return newStep;
    }

    static async createSimpleStepExecutors(
        workflowStep: WorkflowStep,
        rootPath: string,
        bindings: Dictionary<any>,
        logger: Logger,
    ): Promise<StepExecutor[]> {
        const steps = workflowStep.steps as SimpleStep[];
        steps.forEach((step) => (step.type = StepType.Simple));
        try {
            return await Promise.all(
                steps.map((step) => StepExecutorFactory.create(step, rootPath, bindings, logger)),
            );
        } catch (error: any) {
            throw new StepCreationError(error.message, workflowStep.name, error.stepName);
        }
    }
}
