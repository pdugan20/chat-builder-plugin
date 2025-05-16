import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface AnthropicContextType {
  anthropicKey: string | null;
  setAnthropicKey: (key: string | null) => void;
}

const AnthropicContext = createContext<AnthropicContextType | undefined>(undefined);

export function AnthropicProvider({ children }: { children: ReactNode }) {
  const [anthropicKey, setAnthropicKey] = useState<string | null>(null);

  useEffect(() => {
    onmessage = (event) => {
      const { type } = event.data.pluginMessage;

      switch (type) {
        case 'HAS_ANTHROPIC_KEY':
          if (event.data.pluginMessage.hasKey) {
            setAnthropicKey(event.data.pluginMessage.key);
          }
          break;

        case 'UPDATE_ANTHROPIC_KEY':
          if (event.data.pluginMessage.keyDidUpdate) {
            setAnthropicKey(event.data.pluginMessage.key);
          }
          break;

        default:
          break;
      }
    };
  }, []);

  const value = useMemo(() => ({ anthropicKey, setAnthropicKey }), [anthropicKey]);

  return <AnthropicContext.Provider value={value}>{children}</AnthropicContext.Provider>;
}

export function useAnthropic() {
  const context = useContext(AnthropicContext);
  if (context === undefined) {
    throw new Error('useAnthropic must be used within an AnthropicProvider');
  }
  return context;
}
