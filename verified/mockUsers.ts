import { CurrentUser } from '@/types';

export interface MockUser extends CurrentUser {
  username: string;
  password: string;
  inGroup: boolean;
  groupId?: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: 'user1',
    username: 'guest1',
    password: '1',
    name: 'Joey',
    age: 21,
    location: 'Columbus, OH',
    inGroup: true,
    groupId: 'group1',
    about: 'Sigma Chi brother, gym enthusiast, and future business major. Looking for fun double dates and new connections.',
    photos: [
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg', // Consistent guy, smiling headshot
      'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg', // Same guy, casual outfit
      'https://images.pexels.com/photos/1250426/pexels-photo-1250426.jpeg', // Same guy, active shot
      'https://images.pexels.com/photos/1250452/pexels-photo-1250452.jpeg'  // Same guy, social setting
    ],
    prompts: [
      {
        question: 'My ideal weekend...',
        answer: 'Chapter events, hitting the gym, and game day with the bros.'
      },
      {
        question: 'Best campus spot...',
        answer: 'The quad during spring, perfect for frisbee and hanging out.'
      }
    ]
  },
  {
    id: 'user2', 
    username: 'guest2', 
    password: '2',
    name: 'Lance',
    age: 22,
    location: 'Columbus, OH',
    inGroup: true,
    groupId: 'group1',
    about: 'Beta Theta Pi president, intramural sports champion. Always down for beach volleyball and tailgates.',
    photos: [
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', // Different guy, clean headshot
      'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg', // Same guy, casual
      'https://images.pexels.com/photos/2379006/pexels-photo-2379006.jpeg', // Same guy, active
      'https://images.pexels.com/photos/2379002/pexels-photo-2379002.jpeg'  // Same guy, social
    ],
    prompts: [
      {
        question: 'Favorite fraternity tradition...',
        answer: 'Our annual philanthropy event that raises money for local charities.'
      },
      {
        question: 'Perfect first date idea...',
        answer: 'Beach volleyball at the rec center followed by smoothies.'
      }
    ]
  }
];

// Re-export the getImageSource function from utils
export { getImageSource } from '@/utils/imageHelper';