import { useState, useEffect } from 'react';
import { MESSAGE_TYPE } from '../../constants/messages';

interface PluginMessageState {
  hasFonts: boolean;
  hasComponentLibrary: boolean | undefined;
  hasLocalComponents: boolean | undefined;
  isLoading: boolean;
}

export default function usePluginMessages(): PluginMessageState {
  const [hasFonts, setHasFonts] = useState(false);
  const [hasComponentLibrary, setHasComponentLibrary] = useState<boolean | undefined>(undefined);
  const [hasLocalComponents, setHasLocalComponents] = useState<boolean | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      const { type, hasFonts: fonts, hasLibrary, hasLocalComponents: localComponents } = event.data.pluginMessage;

      switch (type) {
        case MESSAGE_TYPE.HAS_FONTS:
          setHasFonts(fonts);
          break;

        case MESSAGE_TYPE.HAS_COMPONENT_LIBRARY:
          setHasComponentLibrary(hasLibrary);
          setIsLoading(false);
          break;

        case MESSAGE_TYPE.HAS_LOCAL_COMPONENTS:
          setHasLocalComponents(localComponents);
          break;

        default:
          break;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return {
    hasFonts,
    hasComponentLibrary,
    hasLocalComponents,
    isLoading,
  };
}
