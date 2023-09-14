import { BindingProvider } from './provider';
import { Scenario } from '../../types';

export const data = [
  {
    output: 'Got binding from provider.Got binding from normal binding.',
    options: {
      bindingProvider: BindingProvider.INSTANCE,
    },
  },
  {
    workflowPath: 'bad_binding_from_provider.yaml',
    options: {
      bindingProvider: BindingProvider.INSTANCE,
    },
    error: {
      message: 'Binding not found',
    },
  },
] as Scenario[];
