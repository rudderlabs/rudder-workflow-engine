import { WorkflowBindingProvider } from '../../../src';
export class BindingProvider implements WorkflowBindingProvider {
  static readonly INSTANCE = new BindingProvider();
  provide(name: string): Promise<any> {
    if (name == 'message') {
      return Promise.resolve({ message: 'Got binding from provider.' });
    }
    return Promise.reject(new Error('Binding not found'));
  }
}
