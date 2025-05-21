import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MESSAGE_TYPE } from '../../constants/messages';

export interface PluginState {
  hasFonts: boolean;
  hasComponentLibrary: boolean | undefined;
  hasLocalComponents: boolean | undefined;
  isLoading: boolean;
}

interface PluginContextType {
  state: PluginState;
}

const PluginContext = createContext<PluginContextType | undefined>(undefined);

export function PluginProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [state, setState] = useState<PluginState>({
    hasFonts: false,
    hasComponentLibrary: undefined,
    hasLocalComponents: undefined,
    isLoading: true,
  });

  const value = useMemo(() => ({ state }), [state]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const { type, hasFonts: fonts, hasLibrary, hasLocalComponents: localComponents } = event.data.pluginMessage;

      switch (type) {
        case MESSAGE_TYPE.HAS_FONTS:
          setState((prev) => ({ ...prev, hasFonts: fonts }));
          break;

        case MESSAGE_TYPE.HAS_COMPONENT_LIBRARY:
          setState((prev) => ({ ...prev, hasComponentLibrary: hasLibrary, isLoading: false }));
          break;

        case MESSAGE_TYPE.HAS_LOCAL_COMPONENTS:
          setState((prev) => ({ ...prev, hasLocalComponents: localComponents }));
          break;

        default:
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return <PluginContext.Provider value={value}>{children}</PluginContext.Provider>;
}

export function usePlugin(): PluginContextType {
  const context = useContext(PluginContext);
  if (context === undefined) {
    throw new Error('usePlugin must be used within a PluginProvider');
  }
  return context;
}
