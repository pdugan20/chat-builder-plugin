import { BuildChatUserInterfaceProps } from '../types/chat';
import { buildFrame } from '../utils/frame';
import { getFirstChatItemDateTime, isLastChatItemSender, getRecipientName } from '../utils/chat';
import {
  loadComponentSets,
  updateEmojiKeyIds,
  createTimestampInstance,
  createStatusInstance,
} from '../services/component';
import { DEVICE_WIDTH } from '../constants/dimensions';
import buildPrototype from './build-prototype';
import { MESSAGE_TYPE } from '../constants/messages';

import { FrameManager } from '../services/frame-manager';
import { MessageBuilder } from '../services/message-builder';
import { LayoutManager } from '../services/layout-manager';
import { ProgressTracker } from '../services/progress-tracker';

export default async function buildChatUserInterface({
  theme = 'light',
  width = DEVICE_WIDTH,
  itemSpacing = 8,
  bubbleStyle = 'iOS',
  name,
  data,
  includePrototype = false,
}: BuildChatUserInterfaceProps): Promise<void> {
  const frameManager = FrameManager.getInstance();
  const messageBuilder = MessageBuilder.getInstance();
  const layoutManager = LayoutManager.getInstance();
  const progressTracker = ProgressTracker.getInstance();

  progressTracker.reset();

  try {
    // Phase 1: Loading
    const loadResult = await progressTracker.withProgress('loading', 4, async () => {
      const originalX = frameManager.findNextChatPosition();
      const { senderSet, recipientSet, statusSet, timestampSet } = await loadComponentSets();
      progressTracker.incrementProgress();

      const tempFrame = await buildFrame(theme, width, itemSpacing, name);
      progressTracker.incrementProgress();

      await updateEmojiKeyIds();
      progressTracker.incrementProgress();

      const threadComponentSet = layoutManager.findThreadComponentSet();
      if (!threadComponentSet) {
        throw new Error('Thread component set not found');
      }
      progressTracker.incrementProgress();

      return { originalX, senderSet, recipientSet, statusSet, timestampSet, tempFrame, threadComponentSet };
    });

    if (!loadResult || progressTracker.isCancelled()) {
      return;
    }

    const { originalX, senderSet, recipientSet, statusSet, timestampSet, tempFrame, threadComponentSet } = loadResult;
    const items = data;

    // Phase 2: Creating messages
    const messageInstances = await progressTracker.withProgress('creating', items.length, async () => {
      const instances = await messageBuilder.createMessageInstances(items, { senderSet, recipientSet }, bubbleStyle);

      // Update progress as messages are created
      for (let i = 0; i < instances.length; i += 1) {
        progressTracker.incrementProgress();
        if (progressTracker.isCancelled()) {
          return null;
        }
      }

      return instances;
    });

    if (!messageInstances || progressTracker.isCancelled()) {
      tempFrame.remove();
      return;
    }

    // Phase 3: Styling and layout
    await progressTracker.withProgress('styling', 3, async () => {
      // Create and append timestamp
      const { date, time } = getFirstChatItemDateTime(items);
      const timestampInstance = await createTimestampInstance(timestampSet, date, time);
      tempFrame.appendChild(timestampInstance);
      timestampInstance.layoutSizingHorizontal = 'FILL';
      progressTracker.incrementProgress();

      // Batch append all message instances
      await layoutManager.batchAppendToFrame(tempFrame, messageInstances);
      progressTracker.incrementProgress();

      // Create and append status for 1:1 chats
      const uniqueRecipients = new Set(items.filter((item) => item.role === 'recipient').map((item) => item.name));
      const isGroupChat = uniqueRecipients.size > 1;

      if (!isGroupChat) {
        const recipientName = getRecipientName(items);
        const hasAction = isLastChatItemSender(items);
        const statusInstance = await createStatusInstance(
          statusSet,
          `${recipientName} has notifications silenced`,
          hasAction
        );
        tempFrame.appendChild(statusInstance);
        statusInstance.layoutSizingHorizontal = 'FILL';
      }
      progressTracker.incrementProgress();

      return isGroupChat;
    });

    if (progressTracker.isCancelled()) {
      tempFrame.remove();
      return;
    }

    // Phase 4: Finalizing
    await progressTracker.withProgress('finalizing', 3, async () => {
      // Find the appropriate thread variant
      const isGroupChat = new Set(items.filter((item) => item.role === 'recipient').map((item) => item.name)).size > 1;
      const threadVariant = layoutManager.findThreadVariant(threadComponentSet, isGroupChat);

      if (!threadVariant) {
        throw new Error(`Could not find thread variant: ${isGroupChat ? 'Group' : '1:1'}`);
      }
      progressTracker.incrementProgress();

      // Create the frame component
      const frameComponent = await frameManager.createFrameComponent(tempFrame, originalX);
      progressTracker.incrementProgress();

      // Set theme and background
      await frameManager.setFrameThemeAndBackground(frameComponent, theme);
      progressTracker.incrementProgress();

      // Clean up
      tempFrame.remove();
      messageBuilder.clearCache();

      // Build prototype or focus viewport
      if (includePrototype) {
        await buildPrototype(frameComponent, threadVariant, items, theme, isGroupChat);
      } else {
        await layoutManager.focusViewport([frameComponent]);
      }

      return frameComponent;
    });
  } catch (error) {
    // Error already handled by posting to UI
    figma.ui.postMessage({
      type: MESSAGE_TYPE.POST_API_ERROR,
      error: error instanceof Error ? error.message : 'Failed to build chat UI',
      retryable: true,
    });
  } finally {
    // Signal completion
    figma.ui.postMessage({
      type: MESSAGE_TYPE.BUILD_COMPLETE,
    });
  }
}
