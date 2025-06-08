export interface Message {
  id: string;
  groupId: string;
  sender: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    groupId: 'group1',
    sender: 'Joey',
    content: 'Hey Lance, ready for the basketball game tonight?',
    timestamp: '2024-03-15T18:30:00Z',
    read: true
  },
  {
    id: 'm2',
    groupId: 'group1',
    sender: 'Lance',
    content: 'Absolutely! Should we grab dinner after?',
    timestamp: '2024-03-15T18:31:00Z',
    read: true
  },
  {
    id: 'm3',
    groupId: 'group1',
    sender: 'Joey',
    content: 'Perfect! I know a great pizza place nearby 🍕',
    timestamp: '2024-03-15T18:32:00Z',
    read: false
  }
];

export function getMessagesByGroupId(groupId: string): Message[] {
  return MOCK_MESSAGES.filter(message => message.groupId === groupId);
}