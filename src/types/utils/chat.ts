import { CHAT_ROLES } from '../../constants/components';

export interface ChatDateTime {
  date: string;
  time: string;
}

export interface ChatParticipant {
  name: string;
  role: typeof CHAT_ROLES.SENDER | typeof CHAT_ROLES.RECIPIENT;
}
