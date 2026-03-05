export function getExamplePrompt(): string {
  return `<examples>
<example>
<TOPIC_AND_TONE>Two friends discussing going to see the movie Sinners.</TOPIC_AND_TONE>
<MAX_MESSAGES>10</MAX_MESSAGES>
<NUM_PARTICIPANTS>2</NUM_PARTICIPANTS>

<ideal_output>
[
  {
    "name": "Mike Johnson",
    "gender": "male",
    "role": "sender",
    "message": "Hey, have you heard about that new horror movie Sinners that just came out?",
    "time": "3:15 PM",
    "emojiReaction": null,
    "messagesInGroup": 1
  },
  {
    "name": "Amanda Chen",
    "gender": "female",
    "role": "recipient",
    "message": "OMG yes! I've been dying to see it. The reviews are saying it's the scariest movie of the year!",
    "time": "3:17 PM",
    "emojiReaction": "exclamation",
    "messagesInGroup": 2
  },
  {
    "name": "Amanda Chen",
    "gender": "female",
    "role": "recipient",
    "message": "Do you want to go see it this weekend?",
    "time": "3:17 PM",
    "emojiReaction": null,
    "messagesInGroup": 2
  },
  {
    "name": "Mike Johnson",
    "gender": "male",
    "role": "sender",
    "message": "Definitely! I'm free Saturday night. How about you?",
    "time": "3:20 PM",
    "emojiReaction": "thumbsUp",
    "messagesInGroup": 2
  },
  {
    "name": "Mike Johnson",
    "gender": "male",
    "role": "sender",
    "message": "We could check out the 7:30 show at the Regal downtown",
    "time": "3:21 PM",
    "emojiReaction": null,
    "messagesInGroup": 2
  },
  {
    "name": "Amanda Chen",
    "gender": "female",
    "role": "recipient",
    "message": "Saturday at 7:30 works perfect for me! Should we grab dinner before?",
    "time": "3:23 PM",
    "emojiReaction": "heart",
    "messagesInGroup": 1
  },
  {
    "name": "Mike Johnson",
    "gender": "male",
    "role": "sender",
    "message": "Great idea! That Italian place next to the theater is pretty good. Wanna try that?",
    "time": "3:25 PM",
    "emojiReaction": null,
    "messagesInGroup": 1
  },
  {
    "name": "Amanda Chen",
    "gender": "female",
    "role": "recipient",
    "message": "Perfect! Let's meet there at 5:30? That should give us plenty of time before the movie.",
    "time": "3:28 PM",
    "emojiReaction": null,
    "messagesInGroup": 2
  },
  {
    "name": "Amanda Chen",
    "gender": "female",
    "role": "recipient",
    "message": "I heard the ending of Sinners is absolutely wild. I'm so excited!",
    "time": "3:29 PM",
    "emojiReaction": "haha",
    "messagesInGroup": 2
  },
  {
    "name": "Mike Johnson",
    "gender": "male",
    "role": "sender",
    "message": "It's a date! 5:30 at Bella's and then Sinners at 7:30. I'll book the tickets online tonight so we don't have to worry about it selling out.",
    "time": "3:32 PM",
    "emojiReaction": "exclamation",
    "messagesInGroup": 1
  }
]
</ideal_output>
</example>
<example>
<TOPIC_AND_TONE>Three friends planning a hiking trip this weekend.</TOPIC_AND_TONE>
<MAX_MESSAGES>8</MAX_MESSAGES>
<NUM_PARTICIPANTS>3</NUM_PARTICIPANTS>

<ideal_output>
[
  {
    "name": "Jordan Lee",
    "gender": "male",
    "role": "sender",
    "message": "Who's down for a hike Saturday?",
    "time": "6:02 PM",
    "emojiReaction": null,
    "messagesInGroup": 1
  },
  {
    "name": "Priya Patel",
    "gender": "female",
    "role": "recipient",
    "message": "I'm in! Where were you thinking?",
    "time": "6:05 PM",
    "emojiReaction": null,
    "messagesInGroup": 1
  },
  {
    "name": "Marcus Rivera",
    "gender": "male",
    "role": "recipient",
    "message": "Same, been wanting to get outside",
    "time": "6:07 PM",
    "emojiReaction": "thumbsUp",
    "messagesInGroup": 1
  },
  {
    "name": "Jordan Lee",
    "gender": "male",
    "role": "sender",
    "message": "Eagle Creek trail? It's like 4 miles",
    "time": "6:09 PM",
    "emojiReaction": null,
    "messagesInGroup": 2
  },
  {
    "name": "Jordan Lee",
    "gender": "male",
    "role": "sender",
    "message": "We could start around 9am",
    "time": "6:09 PM",
    "emojiReaction": null,
    "messagesInGroup": 2
  },
  {
    "name": "Priya Patel",
    "gender": "female",
    "role": "recipient",
    "message": "Love that trail. 9 works for me",
    "time": "6:12 PM",
    "emojiReaction": "heart",
    "messagesInGroup": 1
  },
  {
    "name": "Marcus Rivera",
    "gender": "male",
    "role": "recipient",
    "message": "Can we do 9:30? I'm slow in the morning lol",
    "time": "6:14 PM",
    "emojiReaction": null,
    "messagesInGroup": 1
  },
  {
    "name": "Jordan Lee",
    "gender": "male",
    "role": "sender",
    "message": "Haha fine 9:30 it is. I'll drive",
    "time": "6:15 PM",
    "emojiReaction": "haha",
    "messagesInGroup": 1
  }
]
</ideal_output>
</example>
</examples>`;
}

interface GetInstructionsPromptParams {
  prompt: string;
  maxMessages: string;
  participants: string;
}

export function getInstructionsPrompt({ prompt, maxMessages, participants }: GetInstructionsPromptParams): string {
  const participantCount = parseInt(participants, 10);
  const recipientCount = participantCount - 1;
  const chatType = participantCount > 2 ? 'GROUP CHAT conversation' : 'conversation';

  return `Generate an iMessage ${chatType} as a valid JSON array.

<requirements>
- Topic/tone: ${prompt}
- Max messages: ${maxMessages}
- Total participants: ${participants} (1 sender + ${recipientCount} recipient${recipientCount > 1 ? 's' : ''})
- Exactly one participant with role "sender", exactly ${recipientCount} with role "recipient"
- Each participant needs a unique realistic first+last name and gender (male/female)
- Times in "H:MM AM/PM" format, chronological order
</requirements>

<messagesInGroup_rules>
messagesInGroup = total number of consecutive messages by the same person in a row. Every message in that group gets the same count.

Example sequence:
  Alice  -> messagesInGroup: 2
  Alice  -> messagesInGroup: 2
  Bob    -> messagesInGroup: 1
  Alice  -> messagesInGroup: 3
  Alice  -> messagesInGroup: 3
  Alice  -> messagesInGroup: 3
  Bob    -> messagesInGroup: 2
  Bob    -> messagesInGroup: 2
</messagesInGroup_rules>`;
}
