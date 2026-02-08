import MODE_ID from '../constants/collections';
import { VARIABLES } from '../constants/components';
import COLORS from '../constants/colors';
import { FRAME_SPACING, FRAME_PADDING } from '../constants/dimensions';

// State
let lastFrameX = 0;

// Helper functions
async function getThreadBackgroundVariable(): Promise<Variable | null> {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const localColorCollection = localCollections.find((c) => c.name === 'Color');

  if (localColorCollection) {
    const variablePromises = localColorCollection.variableIds.map((id) => figma.variables.getVariableByIdAsync(id));
    const variables = await Promise.all(variablePromises);
    return variables.find((v) => v !== null && v.name === VARIABLES.THREAD_BACKGROUND) || null;
  }

  return null;
}

async function getColorCollection(): Promise<VariableCollection | null> {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  return localCollections.find((c) => c.name === 'Color') || null;
}

// Frame styling functions
async function setFrameBackgroundFill(frame: FrameNode): Promise<void> {
  const threadBackground = await getThreadBackgroundVariable();

  if (threadBackground) {
    frame.fills = [
      figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: COLORS.WHITE }, 'color', threadBackground),
    ];
  }
}

async function setFrameStyle(frame: FrameNode, theme: 'light' | 'dark'): Promise<void> {
  const collection = await getColorCollection();

  if (collection) {
    frame.setExplicitVariableModeForCollection(collection, MODE_ID[theme]);
  }
}

// Frame layout functions
async function resizeFrame(frame: FrameNode, width: number): Promise<void> {
  frame.resize(width, frame.height);
}

function positionFrame(frame: FrameNode, width: number): void {
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
  // chatItems?: any[] // Removed unused parameter
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
  frame.paddingLeft = FRAME_PADDING.left;
  frame.paddingRight = FRAME_PADDING.right;
  frame.paddingTop = FRAME_PADDING.top;
  frame.paddingBottom = FRAME_PADDING.bottom;

  frame.layoutMode = 'VERTICAL';
  frame.itemSpacing = itemSpacing;

  return frame;
}

export async function setFrameThemeAndBackground(
  frame: FrameNode | ComponentNode,
  theme: 'light' | 'dark'
): Promise<void> {
  const localCollections = await figma.variables.getLocalVariableCollectionsAsync();
  const localColorCollection = localCollections.find((c) => c.name === 'Color');

  if (localColorCollection) {
    // Set the variable mode
    frame.setExplicitVariableModeForCollection(localColorCollection, MODE_ID[theme]);

    // Get and set the background color
    const variablePromises = localColorCollection.variableIds.map((id) => figma.variables.getVariableByIdAsync(id));
    const variables = await Promise.all(variablePromises);
    const threadBackground = variables.find((v) => v !== null && v.name === VARIABLES.THREAD_BACKGROUND);

    if (threadBackground) {
      frame.fills = [
        figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: COLORS.WHITE }, 'color', threadBackground),
      ];
    }
  }
}
