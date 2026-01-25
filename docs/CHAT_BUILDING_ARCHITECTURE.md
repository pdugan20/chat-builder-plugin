# Chat Building Architecture

This document explains how the `build-chat-ui.ts` and `build-prototype.ts` modules work together to create realistic iMessage chat interfaces in Figma.

## Overview

The chat building system consists of two main modules:

1. **build-chat-ui.ts** - Creates the main chat conversation UI component
2. **build-prototype.ts** - Creates an interactive prototype frame with the full iMessage interface

## build-chat-ui.ts

### Purpose

Creates a scrollable chat conversation component with messages, timestamps, and status indicators.

### Key Functions

#### `buildChatUserInterface(props)`

Main entry point that orchestrates the entire chat building process.

**Parameters:**

- `theme`: 'light' | 'dark' - Visual theme
- `width`: number - Frame width (default: 430px)
- `itemSpacing`: number - Space between messages (default: 8px)
- `bubbleStyle`: string - Message bubble style (e.g., 'iOS')
- `name`: string - Chat name/title
- `data`: ChatItem[] - Array of chat messages
- `includePrototype`: boolean - Whether to create prototype frame

**Process:**

1. Determines position for new chat component (auto-positions to right of existing components)
2. Creates temporary frame with proper theme and spacing
3. Adds timestamp header showing date/time of first message
4. Processes all messages in parallel for performance
5. Appends messages to frame in correct order
6. Adds status indicator
7. Converts temporary frame to component
8. Optionally builds prototype if requested
9. Posts completion message to UI

#### `createMessageInstance()`

Creates individual message bubble instances.

**Key Features:**

- Handles message grouping (multiple consecutive messages from same sender)
- Manages emoji reactions
- Differentiates between sender and recipient messages
- Supports group chat with sender names

#### `createSenderInstance()`

Creates blue sender message bubbles.

**Features:**

- Sets message count for grouped messages
- Handles emoji reactions
- Adds optional mustache text
- Supports group chat indicators

#### `createRecipientInstance()`

Creates gray recipient message bubbles.

**Features:**

- Mirrors sender functionality for recipient side
- Sets profile photos based on gender
- Shows sender names in group chats
- Flips bubble orientation horizontally

### Performance Optimizations

1. **Hidden Construction**: Components are built while hidden to prevent visual artifacts
2. **Parallel Processing**: Messages created concurrently then appended in batch
3. **Yield Points**: Strategic `yieldToMainThread()` calls prevent UI freezing
4. **Batch Operations**: Groups DOM operations to minimize reflows

### Position Management

The system automatically positions new chats:

- First chat appears at origin (0, 0)
- Subsequent chats position 200px to the right of the last component
- Prototypes add 50px spacing from their chat component

## build-prototype.ts

### Purpose

Creates a complete iMessage interface frame containing the chat conversation.

### Key Functions

#### `buildPrototype()`

Main function that creates the prototype frame.

**Parameters:**

- `frameComponent`: ComponentNode - The chat component to embed
- `threadVariant`: ComponentNode - Thread template (1:1 or group)
- `items`: ChatItem[] - Chat data for customization
- `theme`: 'light' | 'dark' - Visual theme
- `isGroupChat`: boolean - Whether it's a group conversation

**Process:**

1. Creates thread component from variant template
2. Customizes navigation bar with chat name and participant count
3. Sets profile photos for participants
4. Creates prototype frame with rounded corners
5. Inserts chat component into placeholder position
6. Applies theme and background
7. Focuses viewport on completed prototype

#### `createThreadComponent()`

Creates customized thread component with proper navigation and photos.

**Customizations:**

- Chat name (recipient name or "X people" for groups)
- Profile photo configuration (single, 2-photo, or 3-photo layout)
- Individual persona selection for each participant

#### `setPersonaProperties()` / `setGroupPersonaProperties()`

Assigns profile photos to participants.

**Logic:**

- Uses hash-based selection for consistent persona assignment
- Cycles through recipients if more photo slots than participants
- Maintains visual consistency with chat bubble profile photos

### Component Structure

The prototype consists of:

```text
Prototype Frame (rounded corners)
└── Thread Instance
    ├── Navigation Bar
    │   ├── Chat Name
    │   └── Profile Photos
    ├── Chat Component (embedded)
    └── Input Bar
```

## Message Processing Flow

### 1. Data Preparation

- Chat items are analyzed for grouping patterns
- First/last message states determined
- Group chat detection performed

### 2. Component Creation

- Messages processed in parallel for speed
- Each message checks if it starts a new group
- Properties set based on role, position, and context

### 3. Visual Assembly

- Components initially hidden during construction
- Batch appended to minimize reflows
- Made visible once fully assembled

### 4. Prototype Integration

- Chat component embedded at placeholder position
- Padding adjusted based on last message sender
- Viewport focused on final result

## Group Chat Handling

The system detects group chats by checking for multiple unique recipients and:

- Shows sender names above recipient messages
- Displays participant count in navigation
- Uses multi-photo layouts in prototype
- Omits status indicators (group chats don't show delivery status)

## Theme and Styling

Both modules support:

- Light/dark theme modes via Figma variable collections
- Dynamic background colors bound to theme variables
- Consistent spacing and padding across components
- Platform-specific styling (iOS bubble styles)

## Error Handling

The system includes:

- Safe property setters that validate before applying
- Component existence checks before operations
- Graceful fallbacks for missing components
- Error messages posted to UI for user feedback

## Performance Considerations

1. **Lazy Loading**: Components loaded only when needed
2. **Caching**: Component sets cached after first load
3. **Batching**: Multiple operations grouped together
4. **Visibility Management**: Components hidden during assembly
5. **Async Operations**: Strategic use of promises and timeouts
6. **Memory Management**: Temporary components cleaned up immediately

## Integration Points

The modules integrate with:

- **Component Service**: For loading and managing Figma components
- **Chat Utils**: For analyzing chat data and patterns
- **Frame Utils**: For creating and styling frames
- **Node Finder**: For locating specific nodes in component trees
- **Constants**: For consistent property names and values

This architecture ensures smooth, performant chat generation while maintaining visual quality and supporting complex features like group chats and message reactions.
