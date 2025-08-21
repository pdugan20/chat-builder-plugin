import { ChatItem } from '../types/chat';
import { MessageInstanceProps } from '../types/chat/components';
import { BUBBLE_PROPERTIES } from '../constants/components';
import emojiKey from '../constants/emojis';
import flipHorizontal from '../utils/transform';
import { getRecipientName } from '../utils/chat';

export function hashNameToIndex(name: string, maxValue: number): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) % maxValue;
}

export function getPersonaForRecipient(
  recipientName: string,
  recipientGender: string,
  personaVariants: ComponentNode[]
): ComponentNode | null {
  const genderKey = recipientGender.charAt(0).toUpperCase() + recipientGender.slice(1);
  const genderVariants = personaVariants.filter((v) => v.name.includes(genderKey));

  if (genderVariants.length === 0) return null;

  const index = hashNameToIndex(recipientName, genderVariants.length);
  return genderVariants[index];
}

export class MessageBuilder {
  private static instance: MessageBuilder;
  private messageCache = new Map<string, InstanceNode>();
  private batchOperations: Array<() => void> = [];

  static getInstance(): MessageBuilder {
    if (!MessageBuilder.instance) {
      MessageBuilder.instance = new MessageBuilder();
    }
    return MessageBuilder.instance;
  }

  async createMessageInstances(
    items: ChatItem[],
    componentSets: {
      senderSet: ComponentSetNode;
      recipientSet: ComponentSetNode;
    },
    bubbleStyle: string
  ): Promise<InstanceNode[]> {
    const messages: string[] = [];
    const instances: InstanceNode[] = [];
    const batchSize = 5;

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map((item, batchIndex) => {
        const index = i + batchIndex;
        const componentSet = item.role === 'sender' ? componentSets.senderSet : componentSets.recipientSet;

        return this.createMessageInstance(item, index, componentSet, bubbleStyle, messages, items);
      });

      const batchResults = await Promise.all(batchPromises);
      instances.push(...batchResults.filter((inst): inst is InstanceNode => inst !== null));

      if (i + batchSize < items.length) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    await this.executeBatchOperations();
    return instances;
  }

  private async createMessageInstance(
    item: ChatItem,
    index: number,
    componentSet: ComponentSetNode,
    bubbleStyle: string,
    messages: string[],
    chatItems: ChatItem[]
  ): Promise<InstanceNode | null> {
    const { role, message, emojiReaction, messagesInGroup, name } = item;

    if (messages.includes(message)) {
      return null;
    }

    const cacheKey = `${role}-${message}-${bubbleStyle}`;
    if (this.messageCache.has(cacheKey)) {
      const cached = this.messageCache.get(cacheKey)!;
      messages.push(message);
      return cached.clone();
    }

    const uniqueRecipients = new Set(chatItems.filter((item) => item.role === 'recipient').map((item) => item.name));
    const isGroupChat = uniqueRecipients.size > 1;

    let groupEmojiReaction = emojiReaction;
    if (messagesInGroup > 1) {
      for (let i = 0; i < messagesInGroup; i++) {
        const groupMessage = chatItems[index + i];
        if (groupMessage && groupMessage.emojiReaction && groupMessage.role === role && groupMessage.name === name) {
          groupEmojiReaction = groupMessage.emojiReaction;
          break;
        }
      }
    }

    const props: MessageInstanceProps = {
      role,
      message,
      emojiReaction: groupEmojiReaction,
      messagesInGroup,
      bubbleStyle,
      index,
      componentSet,
      messages,
      senderName: name,
    };

    const instance =
      role === 'sender'
        ? this.createSenderInstance(props, chatItems)
        : this.createRecipientInstance(props, chatItems, isGroupChat);

    messages.push(message);
    this.messageCache.set(cacheKey, instance);

    return instance;
  }

  private createSenderInstance(props: MessageInstanceProps, chatItems: ChatItem[]): InstanceNode {
    const instance = props.componentSet.defaultVariant.createInstance();
    const availableProps = props.componentSet.componentPropertyDefinitions;

    const uniqueRecipients = new Set(chatItems.filter((item) => item.role === 'recipient').map((item) => item.name));
    const isGroupChat = uniqueRecipients.size > 1;

    const properties: Record<string, string> = {
      Bubbles: props.messagesInGroup.toString(),
      Style: props.bubbleStyle,
      'Has reaction': props.emojiReaction ? 'Yes' : 'No',
      'Has mustache text': 'No',
    };

    if (isGroupChat && 'Is group chat' in availableProps) {
      properties['Is group chat'] = 'Yes';
    }

    this.batchOperations.push(() => {
      Object.entries(properties).forEach(([key, value]) => {
        if (key in availableProps) {
          instance.setProperties({ [key]: value });
        }
      });
    });

    this.setMessageText(instance, props.message);
    this.setMessageGroupProperties(instance, props, chatItems);
    this.handleEmojiReaction(instance, props);

    const isLastMessageInChat = props.index + props.messagesInGroup - 1 === chatItems.length - 1;

    if (isLastMessageInChat) {
      const mustacheProps = {
        'Has mustache text': 'Yes',
        'Mustache#129:16': isGroupChat ? 'Delivered' : 'Delivered Quietly',
      };

      this.batchOperations.push(() => {
        Object.entries(mustacheProps).forEach(([key, value]) => {
          if (key in availableProps) {
            instance.setProperties({ [key]: value });
          }
        });
      });
    }

    return instance;
  }

  private createRecipientInstance(
    props: MessageInstanceProps,
    chatItems: ChatItem[],
    isGroupChat: boolean
  ): InstanceNode {
    const instance = props.componentSet.defaultVariant.createInstance();
    const availableProps = props.componentSet.componentPropertyDefinitions;

    const properties: Record<string, string> = {
      Bubbles: props.messagesInGroup.toString(),
      'Has reaction': props.emojiReaction ? 'Yes' : 'No',
      'Has mustache text': 'No',
    };

    if (isGroupChat && 'Is group chat' in availableProps) {
      properties['Is group chat'] = 'Yes';
    }

    this.batchOperations.push(() => {
      Object.entries(properties).forEach(([key, value]) => {
        if (key in availableProps) {
          instance.setProperties({ [key]: value });
        }
      });
    });

    this.setMessageGroupProperties(instance, props, chatItems);

    if (isGroupChat && props.senderName) {
      this.batchOperations.push(() => {
        const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
        const nameNode = textNodes.find((node) => node.name === 'Sender Name');
        if (nameNode) {
          const firstName = props.senderName.split(' ')[0];
          nameNode.characters = firstName;
        }
      });
    }

    this.setRecipientPersona(instance, props, chatItems);
    this.handleEmojiReaction(instance, props);

    this.batchOperations.push(() => {
      instance.relativeTransform = flipHorizontal(instance);
    });

    return instance;
  }

  private setMessageText(instance: InstanceNode, message: string): void {
    this.batchOperations.push(() => {
      const textNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
      const messageNode = textNodes.find(
        (node) =>
          node.name.toLowerCase().includes('message') ||
          node.name.toLowerCase().includes('bubble') ||
          node.name.toLowerCase().includes('text')
      );

      if (messageNode) {
        messageNode.characters = message;
      }
    });
  }

  private setMessageGroupProperties(instance: InstanceNode, props: MessageInstanceProps, chatItems: ChatItem[]): void {
    this.batchOperations.push(() => {
      const allTextNodes = instance.findAll((node) => node.type === 'TEXT') as TextNode[];
      const messageTextNodes = allTextNodes.filter(
        (node) =>
          node.name === 'Message Text' ||
          node.name.toLowerCase().includes('message') ||
          node.name.toLowerCase().includes('bubble') ||
          node.name.toLowerCase().includes('text')
      );

      const sortedTextNodes = messageTextNodes.sort((a, b) => a.y - b.y);

      for (let i = 0; i < props.messagesInGroup; i += 1) {
        const message = chatItems[props.index + i]?.message;
        if (message && sortedTextNodes[i]) {
          sortedTextNodes[i].characters = message;
          props.messages.push(message);
        }
      }
    });
  }

  private handleEmojiReaction(instance: InstanceNode, props: MessageInstanceProps): void {
    if (instance.exposedInstances.length > 0 && props.emojiReaction) {
      this.batchOperations.push(() => {
        const emojiInstance: InstanceNode = instance.exposedInstances[0];
        const emojiStyle = props.role === 'sender' ? 'color' : 'transparentBlue';
        const emoji = emojiKey[emojiStyle]?.[props.emojiReaction];

        if (props.role === 'recipient') {
          emojiInstance.setProperties({ Style: props.bubbleStyle });
        }

        if (emoji?.id) {
          emojiInstance.setProperties({
            [BUBBLE_PROPERTIES.EMOJI]: emoji.id,
          });
        }
      });
    }
  }

  private setRecipientPersona(instance: InstanceNode, props: MessageInstanceProps, chatItems: ChatItem[]): void {
    const currentRecipient = chatItems.find((item) => item.name === props.senderName && item.role === 'recipient');
    if (!currentRecipient) return;

    this.batchOperations.push(() => {
      const profilePhoto =
        'findOne' in instance
          ? instance.findOne((node) => node.name === 'Profile Photo' || node.name.toLowerCase().includes('profile'))
          : null;

      if (!profilePhoto) return;

      const persona =
        'findOne' in profilePhoto
          ? profilePhoto.findOne((node) => node.name === 'Persona' && node.type === 'INSTANCE')
          : null;

      if (!persona || !('setProperties' in persona)) return;

      const rootNodes = figma.root.findAll();
      const personaSet = rootNodes.find((node) => node.type === 'COMPONENT_SET' && node.name === 'Persona');

      if (!personaSet) return;

      const personaInstance = persona as InstanceNode;
      const personaVariants = (personaSet as ComponentSetNode).children as ComponentNode[];

      const selectedVariant = getPersonaForRecipient(currentRecipient.name, currentRecipient.gender, personaVariants);

      if (selectedVariant) {
        personaInstance.mainComponent = selectedVariant;
      }
    });
  }

  private async executeBatchOperations(): Promise<void> {
    const batchSize = 50;

    while (this.batchOperations.length > 0) {
      const batch = this.batchOperations.splice(0, batchSize);
      batch.forEach((op) => op());

      if (this.batchOperations.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }
  }

  clearCache(): void {
    this.messageCache.clear();
  }
}
