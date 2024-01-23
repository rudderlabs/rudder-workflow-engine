import { WorkflowOptionsInternal } from 'src/workflow';
import { StepCreationError } from '../../errors';
import {
  BatchConfig,
  BatchExecutor,
  BatchStep,
  SimpleStep,
  StepExecutor,
  StepType,
} from '../../types';
import { DefaultBatchWorkflowExecutor } from './default_batch_workflow_executor';
import { SimpleBatchExecutor } from './simple_batch_executor';
import { BatchStepExecutor } from './step_executor';
import { StepExecutorFactory } from '../../factory';

export class BatchStepExecutorFactory {
  static async create(
    step: BatchStep,
    options: WorkflowOptionsInternal,
  ): Promise<BatchStepExecutor> {
    if (step.executor) {
      const executor = options.currentBindings[step.executor] as BatchExecutor;
      if (typeof executor?.execute !== 'function') {
        throw new StepCreationError(`Invalid batch executor: ${step.executor}`, step.name);
      }
      return new BatchStepExecutor(step, executor);
    }
    const defaultExecutor = await this.createDefaultBatchWorkflowExecutor(step, options);
    return new BatchStepExecutor(step, defaultExecutor);
  }

  static async createFilterMapExecutor(
    stepName: string,
    config: BatchConfig,
    options: WorkflowOptionsInternal,
  ): Promise<StepExecutor> {
    const filterStep: SimpleStep = {
      name: stepName,
      type: StepType.Simple,
      loopOverInput: true,
    };

    if (config.filter) {
      filterStep.loopCondition = config.filter;
    }
    filterStep.template = config.map || '.';
    return StepExecutorFactory.create(filterStep, options);
  }

  static async createSimpleBatchExecutors(
    step: BatchStep,
    options: WorkflowOptionsInternal,
  ): Promise<SimpleBatchExecutor[]> {
    const batches = step.batches as BatchConfig[];
    return Promise.all(
      batches.map(async (config: BatchConfig) => {
        let filterMapExector: StepExecutor | undefined;
        if (config.filter) {
          filterMapExector = await this.createFilterMapExecutor(
            `${step.name}-batch-${config.key}`,
            config,
            options,
          );
        }
        return new SimpleBatchExecutor(config, filterMapExector);
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
