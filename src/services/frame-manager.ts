import COLORS from '../constants/colors';
import { VARIABLES } from '../constants/components';
import MODE_ID from '../constants/collections';

export default class FrameManager {
  private static instance: FrameManager;
  private frameCreationQueue: Array<() => Promise<ComponentNode>> = [];
  private isProcessing = false;

  static getInstance(): FrameManager {
    if (!FrameManager.instance) {
      FrameManager.instance = new FrameManager();
    }
    return FrameManager.instance;
  }

  async createFrameComponent(tempFrame: FrameNode, x?: number): Promise<ComponentNode> {
    return new Promise((resolve) => {
      this.frameCreationQueue.push(async () => {
        const frameComponent = figma.createComponent();

        if (x !== undefined) {
          frameComponent.x = x;
        }

        frameComponent.name = tempFrame.name;
        frameComponent.resize(tempFrame.width, tempFrame.height);

        const clonedChildren = await this.batchCloneChildren(tempFrame.children);
        await this.batchAppendChildren(frameComponent, clonedChildren);

        this.copyFrameProperties(frameComponent, tempFrame);

        return frameComponent;
      });

      this.processQueue().then(() => {
        const lastResult = this.frameCreationQueue[this.frameCreationQueue.length - 1];
        if (lastResult) {
          lastResult().then(resolve);
        }
      });
    });
  }

  private async batchCloneChildren(children: readonly SceneNode[]): Promise<SceneNode[]> {
    const clonedChildren: SceneNode[] = [];
    const batchSize = 10;

    for (let i = 0; i < children.length; i += batchSize) {
      const batch = children.slice(i, i + batchSize);
      const clonedBatch = batch
        .map((child) => {
          if ('clone' in child) {
            return child.clone();
          }
          return null;
        })
        .filter((child): child is SceneNode => child !== null);

      clonedChildren.push(...clonedBatch);

      if (i + batchSize < children.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    return clonedChildren;
  }

  private async batchAppendChildren(parent: ComponentNode, children: SceneNode[]): Promise<void> {
    const batchSize = 20;

    for (let i = 0; i < children.length; i += batchSize) {
      const batch = children.slice(i, i + batchSize);
      batch.forEach((child) => parent.appendChild(child));

      if (i + batchSize < children.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  private copyFrameProperties(target: ComponentNode, source: FrameNode): void {
    target.layoutMode = source.layoutMode;
    target.primaryAxisSizingMode = source.primaryAxisSizingMode;
    target.counterAxisSizingMode = source.counterAxisSizingMode;
    target.paddingLeft = source.paddingLeft;
    target.paddingRight = source.paddingRight;
    target.paddingTop = 0;
    target.paddingBottom = 0;
    target.itemSpacing = source.itemSpacing;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    while (this.frameCreationQueue.length > 0) {
      const task = this.frameCreationQueue.shift();
      if (task) {
        await task();
      }
    }
    this.isProcessing = false;
  }

  async setFrameThemeAndBackground(frame: FrameNode | ComponentNode, theme: 'light' | 'dark'): Promise<void> {
    const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const localColorCollection = localCollections.find((c) => c.name === 'Color');

    if (localColorCollection) {
      frame.setExplicitVariableModeForCollection(localColorCollection, MODE_ID[theme]);

      const variablePromises = localColorCollection.variableIds.map((id) => figma.variables.getVariableByIdAsync(id));
      const variables = await Promise.all(variablePromises);
      const threadBackground = variables.find((v) => v.name === VARIABLES.THREAD_BACKGROUND);

      if (threadBackground) {
        frame.fills = [
          figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: COLORS.WHITE }, 'color', threadBackground),
        ];
      }
    }
  }

  findNextChatPosition(): number {
    const allNodes = figma.currentPage.children;
    let rightmostX = -Infinity;

    allNodes.forEach((node) => {
      let rightEdge = -Infinity;

      if (node.type === 'COMPONENT') {
        rightEdge = node.x + node.width;
      } else if (node.type === 'FRAME' && node.name === 'Prototype') {
        rightEdge = node.x + node.width;
      }

      if (rightEdge > rightmostX) {
        rightmostX = rightEdge;
      }
    });

    return rightmostX === -Infinity ? 0 : rightmostX + 200;
  }
}
