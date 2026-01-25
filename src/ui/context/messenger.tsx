import { createContext, useContext, useMemo, ReactNode } from 'react';
import { PluginMessengerService } from '../../services/plugin-messenger';

const MessengerContext = createContext<PluginMessengerService | null>(null);

export function MessengerProvider({ children }: { children: ReactNode }) {
  const messenger = useMemo(() => new PluginMessengerService(), []);

  return <MessengerContext.Provider value={messenger}>{children}</MessengerContext.Provider>;
}

export function useMessenger(): PluginMessengerService {
  const context = useContext(MessengerContext);
  if (!context) {
    throw new Error('useMessenger must be used within MessengerProvider');
  }
  return context;
}
