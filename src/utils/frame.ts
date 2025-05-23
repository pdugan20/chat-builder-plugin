import MODE_ID from '../constants/collections';
import { VARIABLES } from '../constants/components';

// Constants
const FRAME_SPACING = 50;
const DEFAULT_PADDING = {
  left: 16,
  right: 12,
};

// State
let lastFrameX = 0;

// Helper functions
async function getThreadBackgroundVariable(): Promise<Variable | null> {
  const localCollections = figma.variables.getLocalVariableCollections();
  const localColorCollection = localCollections.find((c) => c.name === 'Color');

  if (localColorCollection) {
    const variables = localColorCollection.variableIds.map((id) => figma.variables.getVariableById(id));
    return variables.find((v) => v.name === VARIABLES.THREAD_BACKGROUND) || null;
  }

  return null;
}

async function getColorCollection(): Promise<VariableCollection | null> {
  const localCollections = figma.variables.getLocalVariableCollections();
  return localCollections.find((c) => c.name === 'Color') || null;
}

// Frame styling functions
export async function setFrameBackgroundFill(frame: FrameNode): Promise<void> {
  const threadBackground = await getThreadBackgroundVariable();

  if (threadBackground) {
    frame.fills = [
      figma.variables.setBoundVariableForPaint(
        { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
        'color',
        threadBackground
      ),
    ];
  }
}

export async function setFrameStyle(frame: FrameNode, theme: 'light' | 'dark'): Promise<void> {
  const collection = await getColorCollection();

  if (collection) {
    frame.setExplicitVariableModeForCollection(collection, MODE_ID[theme]);
  }
}

// Frame layout functions
export async function resizeFrame(frame: FrameNode, width: number): Promise<void> {
  frame.resize(width, frame.height);
}

export function positionFrame(frame: FrameNode, width: number): void {
  frame.x = lastFrameX;
  frame.y = 0;
  lastFrameX += width + FRAME_SPACING;
}

// Main frame creation function
export async function buildFrame(
  theme: 'light' | 'dark',
  width: number,
  itemSpacing: number,
  name: string
): Promise<FrameNode> {
  const frame = figma.createFrame();

  // Set frame position
  positionFrame(frame, width);

  // Apply styles
  await setFrameStyle(frame, theme);
  await resizeFrame(frame, width);
  await setFrameBackgroundFill(frame);

  // Set frame properties
  frame.name = `Chat thread: ${name}`;
  frame.paddingLeft = DEFAULT_PADDING.left;
  frame.paddingRight = DEFAULT_PADDING.right;
  frame.layoutMode = 'VERTICAL';
  frame.itemSpacing = itemSpacing;

  return frame;
}

export function setFrameThemeAndBackground(frame: FrameNode | ComponentNode, theme: 'light' | 'dark'): void {
  const localCollections = figma.variables.getLocalVariableCollections();
  const localColorCollection = localCollections.find((c) => c.name === 'Color');

  if (localColorCollection) {
    // Set the variable mode
    frame.setExplicitVariableModeForCollection(localColorCollection, MODE_ID[theme]);

    // Get and set the background color
    const variables = localColorCollection.variableIds.map((id) => figma.variables.getVariableById(id));
    const threadBackground = variables.find((v) => v.name === VARIABLES.THREAD_BACKGROUND);

    if (threadBackground) {
      frame.fills = [
        figma.variables.setBoundVariableForPaint(
          { type: 'SOLID', color: { r: 1, g: 1, b: 1 } },
          'color',
          threadBackground
        ),
      ];
    }
  }
}
