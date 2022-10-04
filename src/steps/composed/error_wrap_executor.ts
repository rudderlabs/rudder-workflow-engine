import { ExecutionBindings } from '../../types';
import { ComposableStepExecutor } from './composable_executor';
import { StepExecutor, StepOutput } from '../types';
import { StepExecutionError } from '../errors';
import { WorkflowUtils } from '../../utils';

export class ErrorWrapStepExecutor extends ComposableStepExecutor {
    constructor(nextExecutor: StepExecutor) {
        super(nextExecutor);
    }

    async execute(input: any, executionBindings: ExecutionBindings): Promise<StepOutput> {
        try {
            return await super.execute(input, executionBindings);
        } catch (error: any) {
            if (error instanceof StepExecutionError) {
                throw error;
            }
            throw new StepExecutionError(error.message,
                WorkflowUtils.getErrorStatus(error),
                this.getStepName(),
                undefined,
                error
            );
        }
    }
}
