import { useState, useEffect } from 'react';
import { MESSAGE_TYPE } from '../../constants/messages';

interface PluginMessageState {
  hasFonts: boolean;
  hasComponentLibrary: boolean;
  hasLocalComponents: boolean;
}

export default function usePluginMessages(): PluginMessageState {
  const [hasFonts, setHasFonts] = useState(false);
  const [hasComponentLibrary, setHasComponentLibrary] = useState(false);
  const [hasLocalComponents, setHasLocalComponents] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const { type } = event.data.pluginMessage;

      switch (type) {
        case MESSAGE_TYPE.HAS_FONTS:
          setHasFonts(event.data.pluginMessage.hasFonts);
          break;
        case MESSAGE_TYPE.HAS_COMPONENT_LIBRARY:
          setHasComponentLibrary(event.data.pluginMessage.hasLibrary);
          break;
        case MESSAGE_TYPE.HAS_LOCAL_COMPONENTS:
          setHasLocalComponents(event.data.pluginMessage.hasLocalComponents);
          break;
        default:
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return {
    hasFonts,
    hasComponentLibrary,
    hasLocalComponents,
  };
}
