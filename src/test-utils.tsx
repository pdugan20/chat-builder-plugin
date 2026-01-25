import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MessengerProvider } from './ui/context/messenger';
import { AnthropicProvider } from './ui/context/anthropic';
import { PluginProvider } from './ui/context/plugin';

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  return (
    <MessengerProvider>
      <AnthropicProvider>
        <PluginProvider>{children}</PluginProvider>
      </AnthropicProvider>
    </MessengerProvider>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';
export { customRender as render };
