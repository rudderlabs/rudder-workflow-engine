import { WorkflowOptionsInternal } from 'src/workflow';
import { StepCreationError } from '../../../steps/errors';
import {
  BatchConfig,
  BatchExecutor,
  BatchStep,
  SimpleStep,
  StepExecutor,
  StepType,
} from '../../../steps/types';
import { DefaultBatchWorkflowExecutor } from './default_batch_workflow_executor';
import { SimpleBatchExecutor } from './simple_batch_executor';
import { BatchStepExecutor } from './step_executor';
import { StepExecutorFactory } from '../../../steps/factory';
import { LoopStepExecutor } from 'src/steps/composed';

export class BatchStepExecutorFactory {
  static async create(
    step: BatchStep,
    options: WorkflowOptionsInternal,
  ): Promise<BatchStepExecutor> {
    if (step.executor) {
      const executor = options.currentBindings[step.executor] as BatchExecutor;
      if (!executor?.execute) {
        throw new StepCreationError(`Invalid batch executor: ${step.executor}`, step.name);
      }
      return new BatchStepExecutor(step, executor);
    }
    const defaultExecutor = await this.createDefaultBatchWorkflowExecutor(step, options);
    return new BatchStepExecutor(step, defaultExecutor);
  }

  static async createFilterExecutor(
    name: string,
    filter: string,
    options: WorkflowOptionsInternal,
  ): Promise<StepExecutor> {
    const filterStep: SimpleStep = {
      name,
      type: StepType.Simple,
      template: filter,
      loopOverInput: true,
    };
    return await StepExecutorFactory.create(filterStep, options);
  }

  static async createSimpleBatchExecutors(
    step: BatchStep,
    options: WorkflowOptionsInternal,
  ): Promise<SimpleBatchExecutor[]> {
    const batches = step.batches as BatchConfig[];
    return Promise.all(
      batches.map(async (config: BatchConfig) => {
        let filterExector: StepExecutor | undefined = undefined;
        if (config.filter) {
          filterExector = await this.createFilterExecutor(
            `${step.name}-batch-${config.key}`,
            config.filter,
            options,
          );
        }
        return new SimpleBatchExecutor(config, filterExector);
      }),
    );
  }

  static async createDefaultBatchWorkflowExecutor(
    step: BatchStep,
    options: WorkflowOptionsInternal,
  ): Promise<DefaultBatchWorkflowExecutor> {
    const executors = await this.createSimpleBatchExecutors(step, options);
    return new DefaultBatchWorkflowExecutor(executors);
  }
}
