import { THREAD_PROPERTIES } from '../constants/components';

export interface LayoutConfig {
  width: number;
  itemSpacing: number;
  theme: 'light' | 'dark';
}

export class LayoutManager {
  private static instance: LayoutManager;
  private pendingLayouts: Array<() => void> = [];

  static getInstance(): LayoutManager {
    if (!LayoutManager.instance) {
      LayoutManager.instance = new LayoutManager();
    }
    return LayoutManager.instance;
  }

  findThreadComponentSet(): ComponentSetNode | undefined {
    const allNodes = figma.root.findAll();
    return allNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Thread') as
      | ComponentSetNode
      | undefined;
  }

  findThreadVariant(threadComponentSet: ComponentSetNode, isGroupChat: boolean): ComponentNode | undefined {
    const variants = threadComponentSet.children as ComponentNode[];
    const variantName = isGroupChat ? THREAD_PROPERTIES.VARIANT_GROUP : THREAD_PROPERTIES.VARIANT;

    return variants.find((variant) => variant.type === 'COMPONENT' && variant.name === variantName);
  }

  async batchAppendToFrame(frame: FrameNode | ComponentNode, children: SceneNode[]): Promise<void> {
    const batchSize = 10;

    for (let i = 0; i < children.length; i += batchSize) {
      const batch = children.slice(i, i + batchSize);

      this.pendingLayouts.push(() => {
        batch.forEach((child) => {
          frame.appendChild(child);
          if ('layoutSizingHorizontal' in child) {
            child.layoutSizingHorizontal = 'FILL';
          }
        });
      });

      if (i + batchSize < children.length) {
        await this.flushLayouts();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    await this.flushLayouts();
  }

  async setLayoutProperties(nodes: SceneNode[]): Promise<void> {
    const batchSize = 20;

    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);

      this.pendingLayouts.push(() => {
        batch.forEach((node) => {
          if ('layoutSizingHorizontal' in node) {
            node.layoutSizingHorizontal = 'FILL';
          }
        });
      });

      if (i + batchSize < nodes.length) {
        await this.flushLayouts();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    await this.flushLayouts();
  }

  async organizeComponentsOnCanvas(components: ComponentNode[], spacing: number = 200): Promise<void> {
    let currentX = 0;

    for (const component of components) {
      this.pendingLayouts.push(() => {
        component.x = currentX;
        component.y = 0;
      });
      currentX += component.width + spacing;
    }

    await this.flushLayouts();
  }

  async focusViewport(nodes: SceneNode[]): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  private async flushLayouts(): Promise<void> {
    if (this.pendingLayouts.length === 0) return;

    const operations = [...this.pendingLayouts];
    this.pendingLayouts = [];

    operations.forEach((op) => op());
  }
}
