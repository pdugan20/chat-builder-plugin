/**
 * Cache for Figma node lookups to avoid expensive traversals
 * Based on Figma's performance recommendations
 */

class NodeCache {
  private cache = new Map<string, SceneNode>();

  private componentSetCache = new Map<string, ComponentSetNode>();

  private lastClearTime = Date.now();

  private readonly CACHE_LIFETIME = 5 * 60 * 1000; // 5 minutes

  /**
   * Clear cache if it's too old to prevent stale references
   */
  private checkCacheAge(): void {
    if (Date.now() - this.lastClearTime > this.CACHE_LIFETIME) {
      this.clear();
    }
  }

  /**
   * Find a component set by name with caching
   */
  findComponentSet(name: string): ComponentSetNode | undefined {
    this.checkCacheAge();

    // Check cache first
    if (this.componentSetCache.has(name)) {
      const cached = this.componentSetCache.get(name);
      // Verify the node still exists and hasn't been removed
      try {
        if (cached && cached.parent) {
          return cached;
        }
      } catch {
        // Node was removed, clear from cache
        this.componentSetCache.delete(name);
      }
    }

    // Not in cache, find it
    const allNodes = figma.root.findAll();
    const found = allNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === name) as
      | ComponentSetNode
      | undefined;

    if (found) {
      this.componentSetCache.set(name, found);
    }

    return found;
  }

  /**
   * Find multiple component sets at once
   */
  findComponentSets(names: string[]): Map<string, ComponentSetNode> {
    const results = new Map<string, ComponentSetNode>();
    const toFind: string[] = [];

    // Check cache for each name
    for (const name of names) {
      const cached = this.findComponentSet(name);
      if (cached) {
        results.set(name, cached);
      } else {
        toFind.push(name);
      }
    }

    // If we still need to find some, do one traversal for all
    if (toFind.length > 0) {
      const allNodes = figma.root.findAll();
      for (const node of allNodes) {
        if (node.type === 'COMPONENT_SET' && toFind.includes(node.name)) {
          results.set(node.name, node);
          this.componentSetCache.set(node.name, node);
        }
      }
    }

    return results;
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.cache.clear();
    this.componentSetCache.clear();
    this.lastClearTime = Date.now();
  }
}

// Singleton instance
export const nodeCache = new NodeCache();

/**
 * Optimized function to find component sets without repeated traversals
 */
export async function findRequiredComponentSets(): Promise<{
  senderSet: ComponentSetNode | null;
  recipientSet: ComponentSetNode | null;
  statusSet: ComponentSetNode | null;
  timestampSet: ComponentSetNode | null;
  threadSet: ComponentSetNode | null;
  personaSet: ComponentSetNode | null;
}> {
  const requiredSets = ['Bubble Sender', 'Bubble Recipient', 'Status', 'Timestamp', 'Thread', 'Persona'];

  const foundSets = nodeCache.findComponentSets(requiredSets);

  return {
    senderSet: foundSets.get('Bubble Sender') || null,
    recipientSet: foundSets.get('Bubble Recipient') || null,
    statusSet: foundSets.get('Status') || null,
    timestampSet: foundSets.get('Timestamp') || null,
    threadSet: foundSets.get('Thread') || null,
    personaSet: foundSets.get('Persona') || null,
  };
}
