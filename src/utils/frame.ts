import { colorCollection, modeId } from '../constants/collections';
import colors from '../constants/colors';

let lastFrameX: number = 0;
const frameSpacing: number = 50;

export async function setFrameBackgroundFill(frame: FrameNode): Promise<void> {
  const threadBackground = await figma.variables.getVariableByIdAsync(colors['Background/General/Thread'].id);

  frame.fills = [
    figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }, 'color', threadBackground),
  ];
}

export async function setFrameStyle(frame: FrameNode, theme: 'light' | 'dark'): Promise<void> {
  const collection = await figma.variables.getVariableCollectionByIdAsync(colorCollection.id);
  if (!collection) {
    return;
  }
  frame.setExplicitVariableModeForCollection(collection, modeId[theme]);
}

export async function resizeFrame(frame: FrameNode, width: number): Promise<void> {
  frame.resize(width, frame.height);
}

export function positionFrame(frame: FrameNode, width: number): void {
  frame.x = lastFrameX;
  frame.y = 0;
  lastFrameX += width + frameSpacing;
}

export async function buildFrame(
  theme: 'light' | 'dark',
  width: number,
  itemSpacing: number,
  name: string
): Promise<FrameNode> {
  const frame: FrameNode = figma.createFrame();
  positionFrame(frame, width);

  await setFrameStyle(frame, theme);
  await resizeFrame(frame, width);
  await setFrameBackgroundFill(frame);

  frame.name = `Chat thread: ${name}`;
  frame.paddingLeft = 16;
  frame.paddingRight = 12;
  frame.layoutMode = 'VERTICAL';
  frame.itemSpacing = itemSpacing;

  return frame;
}
