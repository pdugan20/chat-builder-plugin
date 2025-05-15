export interface ChatDateTime {
  date: string;
  time: string;
}

export interface ChatParticipant {
  name: string;
  role: 'sender' | 'recipient';
}
