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
  const instructions = `You are tasked with generating an iMessage chat conversation based on user inputs. The conversation should be realistic, engaging, and formatted according to specific requirements. Follow these instructions carefully to create the conversation:

1. Input variables:
<topic_and_tone>
${prompt}
</topic_and_tone>

<max_messages>
${maxMessages}
</max_messages>

<num_participants>
${participants}
</num_participants>

2. Participant information:
- Generate names for the number of participants specified in num_participants.
- Each participant should have a first and last name.
- Assign a gender (male or female) to each participant.
- Designate one participant as the "sender" and the rest as "recipients".

3. Message generation:
- Create a conversation based on the topic_and_tone. If no specific tone is mentioned, keep it casual.
- Generate between 1 and 3 messages for each participant's turn before switching to another participant.
- Ensure the total number of messages does not exceed max_messages.
- Assign a time to each message in AM/PM format.
- Randomly add emoji reactions to some messages. Use only these reactions: heart, haha, exclamation, thumbsUp, thumbsDown, question and make sure the emoji is appropriate given the content of the message.
- If a user has sent multiple messages in a row, specify the number of messages as a number.

4. JSON formatting:
- Format the conversation as a JSON array where each object represents a message.
- Include the following properties for each message:
  - name
  - gender
  - role (sender or recipient)
  - message
  - time
  - emojiReaction (if applicable)
  - messagesInGroup

5. Example output format:
[
  {
    "name": "John",
    "gender": "male",
    "role": "sender",
    "message": "Hey everyone, what do you think about the new movie?",
    "time": "2:30 PM",
    "emojiReaction": null,
    "messagesInGroup": 1
  },
  {
    "name": "Sarah",
    "gender": "female",
    "role": "recipient",
    "message": "I loved it! The special effects were amazing.",
    "time": "2:32 PM",
    "emojiReaction": "heart",
    "messagesInGroup": 1
  }
]

6. Generate the conversation:
- Create a realistic conversation based on the given topic and tone.
- Ensure the conversation flows naturally and stays on topic.
- Make the response type JSON
- Make sure to include all required properties for each message.`;

  return instructions;
}
