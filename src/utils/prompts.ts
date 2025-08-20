export function getExamplePrompt(): string {
  return `<examples>
<example>
<TOPIC_AND_TONE>Two friends discussing going to see the movie Sinners.</TOPIC_AND_TONE>
<MAX_MESSAGES>10</MAX_MESSAGES>
<NUM_PARTICIPANTS>2</NUM_PARTICIPANTS>

<ideal_output>
[
  {
    name: 'Mike Johnson',
    gender: 'male',
    role: 'sender',
    message: 'Hey, have you heard about that new horror movie Sinners that just came out?',
    time: '3:15 PM',
    emojiReaction: null,
    messagesInGroup: 1
  },
  {
    name: 'Amanda Chen',
    gender: 'female',
    role: 'recipient',
    message: "OMG yes! I've been dying to see it. The reviews are saying it's the scariest movie of the year!",
    time: '3:17 PM',
    emojiReaction: 'exclamation',
    messagesInGroup: 2
  },
  {
    name: 'Amanda Chen',
    gender: 'female',
    role: 'recipient',
    message: 'Do you want to go see it this weekend?',
    time: '3:17 PM',
    emojiReaction: null,
    messagesInGroup: 2
  },
  {
    name: 'Mike Johnson',
    gender: 'male',
    role: 'sender',
    message: "Definitely! I'm free Saturday night. How about you?",
    time: '3:20 PM',
    emojiReaction: 'thumbsUp',
    messagesInGroup: 2
  },
  {
    name: 'Mike Johnson',
    gender: 'male',
    role: 'sender',
    message: 'We could check out the 7:30 show at the Regal downtown',
    time: '3:21 PM',
    emojiReaction: null,
    messagesInGroup: 2
  },
  {
    name: 'Amanda Chen',
    gender: 'female',
    role: 'recipient',
    message: 'Saturday at 7:30 works perfect for me! Should we grab dinner before?',
    time: '3:23 PM',
    emojiReaction: 'heart',
    messagesInGroup: 1
  },
  {
    name: 'Mike Johnson',
    gender: 'male',
    role: 'sender',
    message: 'Great idea! That Italian place next to the theater is pretty good. Wanna try that?',
    time: '3:25 PM',
    emojiReaction: null,
    messagesInGroup: 1
  },
  {
    name: 'Amanda Chen',
    gender: 'female',
    role: 'recipient',
    message: "Perfect! Let's meet there at 5:30? That should give us plenty of time before the movie.",
    time: '3:28 PM',
    emojiReaction: null,
    messagesInGroup: 2
  },
  {
    name: 'Amanda Chen',
    gender: 'female',
    role: 'recipient',
    message: "I heard the ending of Sinners is absolutely wild. I'm so excited!",
    time: '3:29 PM',
    emojiReaction: 'haha',
    messagesInGroup: 2
  },
  {
    name: 'Mike Johnson',
    gender: 'male',
    role: 'sender',
    message: "It's a date! 5:30 at Bella's and then Sinners at 7:30. I'll book the tickets online tonight so we don't have to worry about it selling out.",
    time: '3:32 PM',
    emojiReaction: 'exclamation',
    messagesInGroup: 1
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

  return `Generate an iMessage GROUP CHAT conversation as a valid JSON array. Follow this exact format:

REQUIREMENTS:
- Topic/Tone: ${prompt}
- Max messages: ${maxMessages}
- Total participants: ${participants} (1 sender + ${recipientCount} recipient${recipientCount > 1 ? 's' : ''})
- EXACTLY ONE participant with role "sender" (the person whose phone this is)
- EXACTLY ${recipientCount} different participant${recipientCount > 1 ? 's' : ''} with role "recipient"
- Each participant must have a unique realistic first+last name and gender (male/female)
- Messages should show natural group chat dynamics with all ${participants} people participating
- Times in "H:MM AM/PM" format, chronological order
- emojiReaction: null OR one of: heart, haha, exclamation, thumbsUp, thumbsDown, question
- Use emoji reactions SPARINGLY - only 2-4 total reactions per conversation, not on every message

CONVERSATION STYLE:
- Keep messages conversational and natural - like real text messages
- Messages should be SHORT (typically 1-2 sentences, max 3)
- Use casual language, contractions, and informal tone
- Include natural reactions, questions, and responses between participants
- Avoid overly formal or long-winded messages

CRITICAL - messagesInGroup Logic:
- messagesInGroup = total number of consecutive messages by the SAME person
- If person sends 1 message alone: messagesInGroup = 1
- If person sends 3 messages in a row: ALL 3 have messagesInGroup = 3
- When different person starts talking: reset counter for their group
- Example: [Alice(1), Alice(1)] → Alice gets messagesInGroup=1, Alice gets messagesInGroup=1
- Example: [Bob(2), Bob(2), Alice(1)] → Bob gets messagesInGroup=2, Bob gets messagesInGroup=2, Alice gets messagesInGroup=1

CRITICAL: Output ONLY the JSON array, no other text. Start with [ and end with ].

EXAMPLE FORMAT:
[
  {
    "name": "Mike Johnson",
    "gender": "male",
    "role": "sender",
    "message": "Hey, want to see that new movie?",
    "time": "3:15 PM",
    "emojiReaction": null,
    "messagesInGroup": 1
  },
  {
    "name": "Sarah Chen",
    "gender": "female",
    "role": "recipient",
    "message": "Yes! I heard it's amazing",
    "time": "3:17 PM",
    "emojiReaction": "exclamation",
    "messagesInGroup": 1
  }
]

Generate realistic conversation based on the topic above:`;
}
