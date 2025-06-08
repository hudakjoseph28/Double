export interface UserPrompt {
  question: string;
  answer: string;
}

export interface User {
  username: string;
  password: string;
  displayName: string;
  avatar: any;
  gallery: any[];
  bio: string;
  prompts: UserPrompt[];
  inGroup: boolean;
  groupId?: string;
}

export const mockUsers: User[] = [
  {
    username: 'guest1',
    password: 'password123',
    displayName: 'Joey',
    avatar: require('../assets/images/icon.png'),
    gallery: [
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
    ],
    bio: 'Tech enthusiast and coffee lover. Always up for an adventure!',
    prompts: [
      {
        question: 'My ideal weekend includes',
        answer: 'Hiking trails and trying new coffee shops',
      },
      {
        question: 'Best travel story',
        answer: 'Backpacking through Europe for 3 months',
      },
      {
        question: 'What I\'m looking for',
        answer: 'A group that loves outdoor activities and good conversations',
      },
    ],
    inGroup: true,
    groupId: 'group1',
  },
  {
    username: 'guest2',
    password: 'password123',
    displayName: 'Lance',
    avatar: require('../assets/images/icon.png'),
    gallery: [
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
    ],
    bio: 'Fitness trainer by day, musician by night. Living life to the fullest!',
    prompts: [
      {
        question: 'My perfect day',
        answer: 'Morning workout, afternoon jam session, evening with friends',
      },
      {
        question: 'What makes me unique',
        answer: 'I can teach you both fitness and guitar',
      },
      {
        question: 'Group activities I enjoy',
        answer: 'Beach volleyball, karaoke nights, and hiking adventures',
      },
    ],
    inGroup: true,
    groupId: 'group1',
  },
  {
    username: 'guest3',
    password: 'password123',
    displayName: 'Emma',
    avatar: require('../assets/images/icon.png'),
    gallery: [
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
    ],
    bio: 'Art curator with a passion for photography and vintage finds.',
    prompts: [
      {
        question: 'My happy place',
        answer: 'Art galleries on a quiet morning',
      },
      {
        question: 'What I bring to a group',
        answer: 'Creative energy and always knowing the best hidden gems in the city',
      },
      {
        question: 'My ideal group activity',
        answer: 'Gallery hopping followed by wine and cheese tasting',
      },
    ],
    inGroup: false,
  },
  {
    username: 'guest4',
    password: 'password123',
    displayName: 'Marcus',
    avatar: require('../assets/images/icon.png'),
    gallery: [
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
    ],
    bio: 'Chef by profession, foodie by heart. Always experimenting with new recipes!',
    prompts: [
      {
        question: 'My specialty',
        answer: 'Organizing amazing dinner parties with fusion cuisine',
      },
      {
        question: 'Favorite group activity',
        answer: 'Cooking classes and food market tours',
      },
      {
        question: 'What I\'m looking for',
        answer: 'Fellow food enthusiasts who love trying new cuisines',
      },
    ],
    inGroup: false,
  },
  {
    username: 'guest5',
    password: 'password123',
    displayName: 'Sofia',
    avatar: require('../assets/images/icon.png'),
    gallery: [
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
      require('../assets/images/icon.png'),
    ],
    bio: 'Travel blogger and language enthusiast. Fluent in 4 languages!',
    prompts: [
      {
        question: 'Next on my bucket list',
        answer: 'Learning Japanese and visiting Tokyo',
      },
      {
        question: 'My perfect group match',
        answer: 'International friends who love cultural exchange',
      },
      {
        question: 'What I bring to the table',
        answer: 'Global perspectives and the best travel recommendations',
      },
    ],
    inGroup: false,
  },
];

export function getImageSource(img: string | number) {
  if (typeof img === 'string') {
    return { uri: img };
  }
  return img;
}