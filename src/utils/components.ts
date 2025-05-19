import emojiKey from '../constants/emojis';

export const transformStyleName = (style: string): string => {
  if (style === 'transparent android') return 'transparentGreen';
  if (style === 'transparent ios') return 'transparentBlue';
  return style.toLowerCase();
};

export const transformEmojiName = (name: string): string => {
  if (name === 'thumbs up') return 'thumbsUp';
  if (name === 'thumbs down') return 'thumbsDown';
  return name.toLowerCase();
};

export const findColorHeart = (
  components: (ComponentNode | ComponentSetNode)[]
): { key: string; id: string } | null => {
  const colorHeart = components.find((component) => component.name.includes('/Color/Heart'));
  if (!colorHeart || !('key' in colorHeart)) return null;
  return {
    key: colorHeart.key,
    id: colorHeart.id,
  };
};

export const addHeartToStyles = (heartInfo: { key: string; id: string }) => {
  ['color', 'transparentBlue', 'transparentGreen'].forEach((style) => {
    if (!emojiKey[style]) {
      emojiKey[style] = {};
    }
    emojiKey[style].heart = heartInfo;
  });
};

export const processComponent = async (component: ComponentNode | ComponentSetNode) => {
  if (!('key' in component)) return;

  const nameParts = component.name.split('/');
  if (nameParts.length < 3) return;

  // Transform style name before using it
  const originalStyle = nameParts[1].toLowerCase();
  const style = transformStyleName(originalStyle);

  // Transform emoji name before any checks
  const originalEmojiName = nameParts[2].toLowerCase();
  const emojiName = transformEmojiName(originalEmojiName);

  // Skip heart as it's already been added
  if (emojiName === 'heart') return;

  if (!emojiKey[style]) {
    emojiKey[style] = {};
  }

  try {
    const importedComponent = await figma.importComponentByKeyAsync(component.key);
    emojiKey[style][emojiName] = {
      key: component.key,
      id: importedComponent.id || component.id,
    };
  } catch (error) {
    emojiKey[style][emojiName] = {
      key: component.key,
      id: component.id,
    };
  }
};
