import { join } from 'path';
import { Logger } from 'pino';
import { Dictionary } from '../../common/types';
import { WorkflowUtils } from '../../workflow/utils';
import { StepCreationError } from '../errors';
import { StepExecutorFactory } from '../factory';
import { SimpleStep, StepExecutor, StepType, WorkflowStep } from '../types';
import { StepUtils } from '../utils';

export class BaseStepUtils {
    static async prepareWorkflowStep(
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
        BaseStepUtils.validateWorkflowStep(newStep);
        return newStep;
    }

    static createSimpleStepExecutors(
        workflowStep: WorkflowStep,
        rootPath: string,
        bindings: Dictionary<any>,
        logger: Logger,
    ): Promise<StepExecutor[]> {
        const steps = workflowStep.steps as SimpleStep[];
        return Promise.all(
            steps.map((step) => StepExecutorFactory.create(step, rootPath, bindings, logger)),
        );
    }

    static validateWorkflowStep(workflowStep: WorkflowStep) {
        if (!workflowStep.steps?.length) {
            throw new StepCreationError('Invalid workflow step configuration', workflowStep.name);
        }
        StepUtils.populateSteps(workflowStep.steps);
        StepUtils.validateSteps(workflowStep.steps, [StepType.Simple]);
    }
}
