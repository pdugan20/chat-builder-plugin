export function createNodeMatcher(exactName: string, fallbackPatterns: string[]) {
  return (node: { name: string }) => {
    // Primary exact match (most reliable)
    if (node.name === exactName) {
      return true;
    }

    // Fallback pattern matching (case insensitive)
    const nodeName = node.name.toLowerCase();
    return fallbackPatterns.some((pattern) => nodeName.includes(pattern));
  };
}

export const NODE_MATCHERS = {
  messageText: (exactName: string) => createNodeMatcher(exactName, ['message', 'bubble', 'text']),
  profilePhoto: (exactName: string) => createNodeMatcher(exactName, ['profile']),
  navigationPhoto: () => createNodeMatcher('', ['photo', 'avatar']),
} as const;
