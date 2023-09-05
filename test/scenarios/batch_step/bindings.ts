import { SimpleBatchExecutor } from '../../../src/steps/base/batch/simple_batch_executor';

export const batchExecutor = new SimpleBatchExecutor({ options: { length: 2 }, key: 'one' });
