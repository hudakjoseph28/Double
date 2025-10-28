import { Group } from '@/types';

export const MOCK_GROUPS: Group[] = [
  {
    id: 'group1',
    title: 'Greek Life Squad',
    location: 'Columbus, OH',
    groupPhoto: 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg',
    groupPhotos: [
      'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg', // Group shot at campus
      'https://images.pexels.com/photos/935835/pexels-photo-935835.jpeg'    // Group social event
    ],
    user1: {
      id: 'jacqueline1',
      name: 'Jacqueline',
      age: 21,
      gender: 'Woman',
      orientation: 'Straight',
      school: 'Ohio State University',
      religion: 'Christian',
      hometown: 'Cleveland, OH',
      drink: 'Socially',
      smoke: 'Never',
      intention: 'Long-term',
      monogamy: true,
      about: 'Delta Gamma sister who loves philanthropy and bringing people together. Business major with a passion for event planning and making lasting memories with my sisters.',
      idealWeekend: 'Brunch with the girls, football tailgate, and ending with a cozy movie night. Perfect mix of social time and relaxation!',
      funFact: 'I can organize a party for 200+ people in under a week and somehow make it look effortless.',
      photo: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg', // Main sorority girl photo
      photos: [
        'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg', // Clean headshot
        'https://images.pexels.com/photos/1542086/pexels-photo-1542086.jpeg', // Same girl, casual
        'https://images.pexels.com/photos/1542087/pexels-photo-1542087.jpeg'  // Same girl, active
      ],
      prompts: [
        {
          question: 'My sorority life...',
          answer: 'Delta Gamma sister, philanthropy chair, and always planning the next social!'
        },
        {
          question: 'Best way to ask me out...',
          answer: 'Coffee before class or suggest we check out that new rooftop bar downtown'
        }
      ]
    },
    user2: {
      id: 'emma1',
      name: 'Emma',
      age: 20,
      gender: 'Woman',
      orientation: 'Bisexual',
      school: 'Ohio State University',
      religion: 'Agnostic',
      hometown: 'Cincinnati, OH',
      drink: 'Regularly',
      smoke: 'Occasionally',
      intention: 'Something casual',
      monogamy: false,
      about: 'Art history major with a love for vintage fashion and indie music. Always down for spontaneous adventures and deep conversations over wine.',
      idealWeekend: 'Vintage shopping in the morning, art gallery hopping in the afternoon, and live music at night. Bonus points if there\'s good food involved!',
      dealbreaker: 'People who don\'t appreciate art or think creativity is a waste of time. Also, anyone who\'s not open-minded about different lifestyles.',
      photo: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg', // Different sorority girl
      photos: [
        'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',  // Clean headshot
        'https://images.pexels.com/photos/733873/pexels-photo-733873.jpeg',  // Same girl, casual
        'https://images.pexels.com/photos/733874/pexels-photo-733874.jpeg'   // Same girl, active
      ],
      prompts: [
        {
          question: 'Perfect Greek Week activity...',
          answer: 'Winning the dance competition with my sisters!'
        },
        {
          question: 'My love language is...',
          answer: 'Quality time and finding the perfect vintage piece for someone special'
        }
      ]
    },
    prompt: {
      question: 'Our ideal double date would be...',
      answer: 'Tailgating before the game, then dinner at our favorite campus spot.'
    }
  }
];

export function getGroupById(groupId: string): Group | undefined {
  return MOCK_GROUPS.find(group => group.id === groupId);
}