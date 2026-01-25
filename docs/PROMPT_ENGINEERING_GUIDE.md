# Prompt Engineering Guide - utils/prompts.ts

## Overview

This document provides detailed analysis of the specific prompts used in `src/utils/prompts.ts` for generating iMessage conversations with Claude API.

## Function: `getExamplePrompt()`

### Purpose

Provides a concrete example to establish format expectations and conversation style for the AI model.

### Structure Analysis

```xml
<examples>
<example>
<TOPIC_AND_TONE>Two friends discussing going to see the movie Sinners.</TOPIC_AND_TONE>
<MAX_MESSAGES>10</MAX_MESSAGES>
<NUM_PARTICIPANTS>2</NUM_PARTICIPANTS>

<ideal_output>
[JSON array of 10 messages]
</ideal_output>
</example>
</examples>
```

### Key Teaching Elements

#### 1. **Realistic Participants**

```javascript
name: 'Mike Johnson',     // First + Last name format
gender: 'male',           // Required gender specification
role: 'sender',           // Phone owner perspective
```

#### 2. **Natural Conversation Flow**

- **Message 1**: Initial topic introduction
- **Messages 2-3**: Enthusiastic response + follow-up question (grouped)
- **Messages 4-5**: Agreement + practical suggestion (grouped)
- **Message 6**: Standalone agreement with dinner suggestion
- **Message 7**: Standalone restaurant suggestion
- **Messages 8-9**: Time coordination + excitement (grouped)
- **Message 10**: Confirmation with action item

#### 3. **Time Progression Pattern**

```text
3:15 PM → 3:17 PM → 3:17 PM → 3:20 PM → 3:21 PM → 3:23 PM → 3:25 PM → 3:28 PM → 3:29 PM → 3:32 PM
```

- 2-5 minute gaps between messages
- Natural pacing for real-time conversation
- No immediate responses (realistic typing time)

#### 4. **Message Grouping Logic Demonstration**

```javascript
// Single message
{ name: 'Mike Johnson', messagesInGroup: 1 }

// Two consecutive messages by Amanda
{ name: 'Amanda Chen', messagesInGroup: 2 }
{ name: 'Amanda Chen', messagesInGroup: 2 }

// Back to single message by Mike
{ name: 'Mike Johnson', messagesInGroup: 1 }
```

#### 5. **Emoji Reaction Strategy**

- Only 4 reactions across 10 messages (40% usage rate)
- Strategic placement: excitement, agreement, humor, confirmation
- Types used: `exclamation`, `thumbsUp`, `heart`, `haha`

## Function: `getInstructionsPrompt()`

### Purpose

Generates dynamic instructions based on user inputs while maintaining strict formatting requirements.

### Parameter Processing

```typescript
interface GetInstructionsPromptParams {
  prompt: string; // User's topic/tone
  maxMessages: string; // Message count limit
  participants: string; // Total participant count
}

const participantCount = parseInt(participants, 10);
const recipientCount = participantCount - 1; // Sender is always 1
```

### Prompt Structure Breakdown

#### 1. **Header & Context Injection**

```text
Generate an iMessage GROUP CHAT conversation as a valid JSON array. Follow this exact format:

REQUIREMENTS:
- Topic/Tone: ${prompt}
- Max messages: ${maxMessages}
- Total participants: ${participants} (1 sender + ${recipientCount} recipient${recipientCount > 1 ? 's' : ''})
```

#### 2. **Critical Role Distribution**

```text
- EXACTLY ONE participant with role "sender" (the person whose phone this is)
- EXACTLY ${recipientCount} different participant${recipientCount > 1 ? 's' : ''} with role "recipient"
```

**Engineering Insight**: This prevents the AI from creating multiple senders or incorrect participant distributions.

#### 3. **Conversation Style Enforcement**

```text
CONVERSATION STYLE - CRITICAL:
- Write like REAL people texting - short, casual, natural
- Messages should be VERY SHORT (usually 5-15 words, max 25 words)
- Use casual language and contractions (don't, can't, I'm, etc.)
- Think like you're typing quickly on a phone
- NO formal language or complete paragraphs
```

**Engineering Insight**: The "CRITICAL" label and specific word counts prevent verbose, essay-like responses common in AI text generation.

#### 4. **Complex Logic Explanation**

```text
CRITICAL - messagesInGroup Logic:
- messagesInGroup = total number of consecutive messages by the SAME person
- If person sends 1 message alone: messagesInGroup = 1
- If person sends 3 messages in a row: ALL 3 have messagesInGroup = 3
- When different person starts talking: reset counter for their group
```

**Examples Provided**:

```text
- Example: [Alice(1), Alice(1)] → Alice gets messagesInGroup=1, Alice gets messagesInGroup=1
- Example: [Bob(2), Bob(2), Alice(1)] → Bob gets messagesInGroup=2, Bob gets messagesInGroup=2, Alice gets messagesInGroup=1
```

**Engineering Insight**: This is the most complex logic requirement and needs explicit examples to prevent AI confusion.

#### 5. **Output Format Enforcement**

```text
CRITICAL: Output ONLY the JSON array, no other text. Start with [ and end with ].
```

**Engineering Insight**: Prevents AI from adding explanatory text or formatting that would break JSON parsing.

#### 6. **Reinforcement Example**

Provides a minimal 2-message example to reinforce the format without overwhelming the instruction context.

## Prompt Engineering Techniques Used

### 1. **Few-Shot Learning**

- Complete example conversation in `getExamplePrompt()`
- Demonstrates all required patterns and edge cases
- Shows realistic conversation dynamics

### 2. **Constraint Specification**

- Explicit word limits (5-15 words typical, 25 max)
- Exact participant role requirements
- Mandatory field specifications

### 3. **Repetitive Reinforcement**

- "CRITICAL" labels on important instructions
- Multiple example formats
- Redundant explanations for complex logic

### 4. **Negative Instructions**

- "NO formal language"
- "no other text"
- "Avoid verbose, essay-like responses"

### 5. **Progressive Complexity**

- Simple requirements first
- Complex logic (messagesInGroup) explained in detail
- Multiple examples for difficult concepts

## Optimization Strategies

### 1. **Context Efficiency**

- Example is comprehensive but concise (10 messages)
- Instructions are detailed but focused
- No redundant information between functions

### 2. **Clear Boundaries**

- XML tags separate example from instructions
- "CRITICAL" sections highlight must-follow rules
- Format examples reinforce structure

### 3. **Error Prevention**

- Explicit logic explanations prevent common mistakes
- Multiple constraint layers catch edge cases
- Negative instructions eliminate unwanted behaviors

## Maintenance Guidelines

### When to Update Examples

- New emoji reactions are added to the system
- Message format requirements change
- Conversation style guidelines evolve

### When to Modify Instructions

- User feedback indicates consistent AI mistakes
- New participant count limits are introduced
- Additional output format requirements

### Testing Recommendations

- Test edge cases (1-2 participants vs 5+ participants)
- Verify message grouping logic with various scenarios
- Validate conversation style across different topics
