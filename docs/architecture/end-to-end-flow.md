# End-to-End Flow: User Input to Chat Component and Prototype

This document explains how user inputs flow through the system to create chat components and prototypes in Figma.

## Overview

The plugin follows a layered architecture with clear separation between the UI (React), plugin layer (Figma API), and external services (Anthropic API). The flow involves multiple phases: input collection, API communication, content generation, and Figma component creation.

## Complete Flow Diagram

```text
User Input → React UI → Plugin Messages → Anthropic API → JSON Parsing → Figma Components → Prototype Creation
     ↓           ↓            ↓               ↓               ↓                ↓                  ↓
  Form Data   Validation   Message Bus   Claude Stream   Chat Structure   Component Tree    Interactive UI
```

## Phase 1: User Input Collection

**Location**: `src/ui/screens/plugin.tsx`

1. **Form Fields Captured**:
   - Participants count (2, 3, or 4)
   - Max messages (5-50)
   - UI style (light/dark)
   - Prompt text (conversation description)
   - Include prototype checkbox

2. **Input Validation**:
   - Prompt must not be empty
   - All required fields must be selected

3. **Form Submission**:
   - User clicks "Generate chat" button
   - Triggers `generateChat()` function from `useChatGeneration` hook

## Phase 2: Chat Generation Process

**Location**: `src/ui/hooks/use-chat-generation.ts`

### Test Data Path

If `useTestData` is enabled:

- Selects pre-built chat data based on participant count
- Sends `BUILD_CHAT_UI` message directly to plugin
- Skips API call entirely

### API Path

For real generation:

1. **API Request Setup**:
   - Creates Anthropic client with user's API key
   - Builds structured prompt with examples and instructions
   - Initiates streaming request to Claude API

2. **Streaming Response Handling**:

   ```typescript
   // Real-time message extraction from stream
   onStream: (chunk) => {
     // Extract individual messages as they arrive
     const messageMatch = chunk.match(/"message"\s*:\s*"([^"]+)"/);
     // Update UI with streaming progress
   };
   ```

3. **Response Processing**:
   - Accumulates full response text
   - Sends `PARSE_AND_BUILD_CHAT` message to plugin with raw JSON

## Phase 3: Message Bus Communication

**Location**: `src/plugin/index.ts`

The plugin receives messages via `figma.ui.onmessage`:

### Key Message Types

- `BUILD_CHAT_UI`: Direct build with structured data
- `PARSE_AND_BUILD_CHAT`: Parse JSON then build
- `UPDATE_ANTHROPIC_KEY`: Store/update API key
- `POST_API_ERROR`: Display error notifications

### Message Processing

```typescript
case MESSAGE_TYPE.PARSE_AND_BUILD_CHAT:
  const parsedData = cleanAndParseJson(msg.rawResponse);
  await buildChatUserInterface({
    data: parsedData,
    theme: msg.style,
    name: msg.prompt,
    includePrototype: msg.includePrototype
  });
```

## Phase 4: JSON Response Parsing

**Location**: `src/utils/json.ts`

1. **JSON Cleaning**:
   - Removes markdown code blocks
   - Strips extra whitespace and formatting
   - Handles malformed JSON structures

2. **Data Validation**:
   - Ensures required fields are present
   - Validates message structure and roles
   - Returns null if parsing fails

3. **Expected JSON Structure**:

   ```json
   [
     {
       "role": "sender|recipient",
       "name": "Person Name",
       "gender": "male|female",
       "message": "Message content",
       "messagesInGroup": 1,
       "emojiReaction": "thumbs_up" // optional
     }
   ]
   ```

## Phase 5: Figma Component Creation

**Location**: `src/scripts/build-chat-ui.ts`

### Initialization Phase

1. **Position Calculation**: `getNextChatPosition()` finds optimal placement
2. **Component Loading**: `loadComponentSets()` loads required Figma components
3. **Frame Creation**: `buildFrame()` creates container with theme and dimensions

### Message Processing

1. **Parallel Instance Creation**:

   ```typescript
   const messagePromises = items.map((item, index) => {
     const componentSet = item.role === 'sender' ? senderSet : recipientSet;
     return createMessageInstance(item, index, componentSet, bubbleStyle, messages, items);
   });
   ```

2. **Component Customization**:
   - **Sender Messages**: Blue bubbles, delivery status, message grouping
   - **Recipient Messages**: Gray bubbles, name display (group chats), persona assignment
   - **Emoji Reactions**: Applied to message groups based on data
   - **Message Groups**: Multiple consecutive messages from same person

3. **Performance Optimization**:
   - All instances created in parallel
   - Hidden during construction to prevent flashing
   - Batch appending for smoother visual assembly
   - Yields to main thread for large message counts

### Visual Assembly

1. **Component Hierarchy**:

   ```text
   Frame Component
   ├── Timestamp Instance
   ├── Message Instance 1
   ├── Message Instance 2
   ├── ...
   └── Status Instance (1:1 chats only)
   ```

2. **Theme Application**:
   - Variable mode set based on light/dark selection
   - Background colors applied via Figma variables
   - Component variants selected appropriately

3. **Positioning and Layout**:
   - Auto-layout with proper spacing
   - Horizontal fill sizing for responsive behavior
   - Proper positioning relative to existing components

## Phase 6: Prototype Creation (Optional)

**Location**: `src/scripts/build-prototype.ts`

If `includePrototype` is enabled:

1. **Thread Component Creation**:
   - Creates instance of Thread component (1:1 or Group variant)
   - Sets contact name and persona based on chat data
   - Positions next to the chat component

2. **Interactive Prototype Frame**:

   ```typescript
   const prototypeFrame = figma.createFrame();
   prototypeFrame.name = 'Prototype';
   // Positioned to the right of chat component
   prototypeFrame.x = frameComponent.x + frameComponent.width + 50;
   ```

3. **Persona Assignment**:
   - Uses consistent name-based hashing for persona selection
   - Matches gender from chat data to appropriate persona variants
   - Handles both individual and group chat scenarios

4. **Final Assembly**:
   - Thread component added to prototype frame
   - Theme and styling applied consistently
   - Interactive prototype ready for presentation

## Phase 7: Completion and Cleanup

### UI Feedback

1. **Progress Indicators**: Streaming messages shown during generation
2. **Error Handling**: API errors displayed with retry options
3. **Completion Signal**: `BUILD_COMPLETE` message sent to UI

### Viewport Management

- For chat-only: Focuses viewport on new component
- For prototype: Includes both components in viewport
- Proper spacing maintained between multiple generations

### Component Lifecycle

1. **Temporary Frame**: Created and hidden during construction
2. **Final Component**: Converted to reusable Figma component
3. **Cleanup**: Temporary elements removed after successful creation
4. **Visibility**: Final component shown only when fully assembled

## Error Handling Throughout Flow

### UI Layer Errors

- Missing API key → Show API key overlay
- Invalid inputs → Disable generate button
- Network issues → Display retry-able error banner

### API Layer Errors

- Rate limiting → Automatic retry with exponential backoff
- Invalid API key → Clear stored key, show setup overlay
- Malformed response → JSON parsing fallback and user notification

### Figma Layer Errors

- Missing components → Check components on plugin load
- Missing fonts → Font loading with user notification
- Component creation failures → Graceful error reporting

## Performance Considerations

1. **Streaming UI Updates**: Batched every 100ms to prevent UI blocking
2. **Parallel Processing**: All message instances created simultaneously
3. **Yielding Strategy**: Main thread yields during heavy operations
4. **Memory Management**: Temporary components cleaned up promptly
5. **Visual Optimization**: Components hidden during assembly to prevent flashing

This end-to-end flow ensures a smooth user experience from input to final Figma component, with robust error handling and performance optimization throughout the entire pipeline.
