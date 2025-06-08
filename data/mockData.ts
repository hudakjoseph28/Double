import { Profile, Group, Conversation, Like, CurrentUser } from '@/types';

/**
 * Modern color system for 2025
 */
export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Michael',
    age: 28,
    location: 'Chicago, IL',
    photos: [
      'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
      'https://images.pexels.com/photos/1157455/pexels-photo-1157455.jpeg',
      'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg'
    ],
    prompts: [
      {
        question: 'Which MJ dunk is your all-time favorite—and why?',
        answer: 'The baseline reverse on Patrick Ewing in \'88—defied physics and defenders.'
      },
      {
        question: 'If you could rock any Air Jordan silhouette every day, which?',
        answer: 'The AJ1 Chicago—classic red, white, and black.'
      }
    ]
  },
  {
    id: '2',
    name: 'Jessica',
    age: 26,
    location: 'New York, NY',
    photos: [
      'https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg',
      'https://images.pexels.com/photos/1078345/pexels-photo-1078345.jpeg',
      'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg'
    ],
    prompts: [
      {
        question: 'My ideal first date...',
        answer: 'Exploring a small town art gallery, followed by coffee at a local cafe.'
      },
      {
        question: 'Two truths and a lie...',
        answer: 'I\'ve climbed Kilimanjaro, I speak three languages, I was on a reality show.'
      },
      {
        question: 'A life goal of mine...',
        answer: 'Write a novel that connects with people in a meaningful way.'
      }
    ]
  },
  {
    id: '3',
    name: 'David',
    age: 30,
    location: 'Los Angeles, CA',
    photos: [
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
      'https://images.pexels.com/photos/1082962/pexels-photo-1082962.jpeg',
      'https://images.pexels.com/photos/1699159/pexels-photo-1699159.jpeg',
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    ],
    prompts: [
      {
        question: 'My most controversial opinion...',
        answer: 'Pineapple absolutely belongs on pizza, and I\'ll die on this hill.'
      },
      {
        question: 'My simple pleasures...',
        answer: 'Rain on the window, fresh coffee at sunrise, and finding a book I can\'t put down.'
      },
      {
        question: 'The key to my heart...',
        answer: 'Intellectual curiosity, a great sense of humor, and homemade pastries.'
      }
    ]
  }
];

// Double dating mock groups
export const mockGroups: Group[] = [
  {
    id: '1',
    title: 'Basketball Fanatics',
    location: 'Los Angeles, CA',
    groupPhoto: 'https://images.pexels.com/photos/3755760/pexels-photo-3755760.jpeg',
    groupPhotos: [
      'https://images.pexels.com/photos/3755760/pexels-photo-3755760.jpeg',
      'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg'
    ],
    user1: {
      id: 'kobe1',
      name: 'Kobe',
      age: 42,
      photo: 'https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg',
      photos: [
        'https://images.pexels.com/photos/1270076/pexels-photo-1270076.jpeg',
        'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg',
        'https://images.pexels.com/photos/2834917/pexels-photo-2834917.jpeg',
        'https://images.pexels.com/photos/3755760/pexels-photo-3755760.jpeg',
        'https://images.pexels.com/photos/2346/sport-high-jump-jump-basketball.jpg'
      ],
      prompts: [
        {
          question: 'My favorite basketball memory...',
          answer: 'Scoring 81 points against the Raptors in 2006. It wasn\'t just about the points—it was about pushing the boundaries of what\'s possible.'
        },
        {
          question: 'My life philosophy in one sentence...',
          answer: 'Mamba Mentality: it\'s about being the best version of yourself every single day, no matter what challenges come your way.'
        },
        {
          question: 'What drives me...',
          answer: 'The pursuit of greatness. Every day is an opportunity to push harder, learn more, and inspire others to find their passion.'
        }
      ],
      interests: ['Basketball', 'Mentoring', 'Business', 'Family', 'Writing'],
      achievements: ['5x NBA Champion', 'MVP', '18x All-Star', 'Academy Award Winner'],
      education: 'Lower Merion High School',
      occupation: 'Professional Athlete & Entrepreneur'
    },
    user2: {
      id: 'shaq1',
      name: 'Shaq',
      age: 48,
      photo: 'https://images.pexels.com/photos/936019/pexels-photo-936019.jpeg',
      photos: [
        'https://images.pexels.com/photos/936019/pexels-photo-936019.jpeg',
        'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg',
        'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
        'https://images.pexels.com/photos/2834916/pexels-photo-2834916.jpeg',
        'https://images.pexels.com/photos/3755755/pexels-photo-3755755.jpeg'
      ],
      prompts: [
        {
          question: 'My signature move...',
          answer: 'The Shaq Attack - dunking with authority! It\'s not just about power, it\'s about making a statement and bringing entertainment to the game.'
        },
        {
          question: 'My biggest passion outside of basketball...',
          answer: 'Making people laugh and smile. Whether it\'s through my DJ performances, my business ventures, or just being myself, bringing joy to others is what I live for.'
        },
        {
          question: 'My definition of success...',
          answer: 'Success isn\'t just about championships—it\'s about building a legacy that impacts future generations and giving back to the community that supported you.'
        }
      ],
      interests: ['Basketball', 'DJing', 'Business', 'Entertainment', 'Philanthropy'],
      achievements: ['4x NBA Champion', 'MVP', '15x All-Star', 'Platinum Recording Artist'],
      education: 'LSU',
      occupation: 'Professional Athlete & Entrepreneur'
    },
    prompt: {
      question: 'Our dream double date would be...',
      answer: 'A friendly 2v2 game followed by dinner and stories about the good old days.'
    }
  },
  {
    id: '2',
    title: 'Adventure Seekers',
    location: 'Denver, CO',
    groupPhoto: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg',
    groupPhotos: [
      'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg',
      'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg'
    ],
    user1: {
      id: 'emma2',
      name: 'Emma',
      age: 28,
      photo: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
      photos: [
        'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
        'https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg'
      ],
      prompts: [
        {
          question: 'My favorite adventure...',
          answer: 'Hiking the Inca Trail to Machu Picchu.'
        }
      ]
    },
    user2: {
      id: 'james2',
      name: 'James',
      age: 30,
      photo: 'https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg',
      photos: [
        'https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg',
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
      ],
      prompts: [
        {
          question: 'Next on my bucket list...',
          answer: 'Climbing Mount Kilimanjaro together.'
        }
      ]
    },
    prompt: {
      question: 'Our perfect double date adventure...',
      answer: 'Rock climbing followed by a sunset picnic with an amazing view.'
    }
  },
  {
    id: '3',
    title: 'Foodies Unite',
    location: 'New York, NY',
    groupPhoto: 'https://images.pexels.com/photos/5876516/pexels-photo-5876516.jpeg',
    user1: {
      id: 'sophia3',
      name: 'Sophia',
      age: 26,
      photo: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg',
      photos: [
        'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg',
        'https://images.pexels.com/photos/1462638/pexels-photo-1462638.jpeg'
      ],
      prompts: [
        {
          question: 'My signature dish...',
          answer: 'Homemade pasta with truffle sauce - it\'s all about the fresh ingredients!'
        }
      ]
    },
    user2: {
      id: 'daniel3',
      name: 'Daniel',
      age: 27,
      photo: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
      photos: [
        'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
        'https://images.pexels.com/photos/1516681/pexels-photo-1516681.jpeg'
      ],
      prompts: [
        {
          question: 'My favorite cuisine...',
          answer: 'Italian - there\'s something magical about the simplicity and flavors.'
        }
      ]
    },
    prompt: {
      question: 'The best meal we\'ve cooked together...',
      answer: 'A 5-course Italian feast with homemade pasta and tiramisu.'
    }
  }
];

// Mock conversations for chat screen
export const mockConversations: Conversation[] = [
  {
    id: '1',
    name: 'Basketball Fanatics',
    profileImage: 'https://images.pexels.com/photos/3755760/pexels-photo-3755760.jpeg',
    lastMessage: 'Looking forward to our game next week!',
    time: '10:30 AM',
    unread: true,
    messages: [
      {
        id: 'm1',
        text: 'Hey! We loved your group profile!',
        sender: 'them',
        timestamp: '10:00 AM',
        status: 'read'
      },
      {
        id: 'm2',
        text: 'Thanks! We\'re always up for a friendly game.',
        sender: 'me',
        timestamp: '10:15 AM',
        status: 'delivered'
      },
      {
        id: 'm3',
        text: 'Looking forward to our game next week!',
        sender: 'them',
        timestamp: '10:30 AM',
        status: 'sent'
      }
    ]
  }
];

// Mock likes for likes screen
export const mockLikes: Like[] = [
  {
    id: '1',
    name: 'Basketball Fanatics',
    age: 25,
    profileImage: 'https://images.pexels.com/photos/3755760/pexels-photo-3755760.jpeg',
    hint: 'They also love playing basketball!',
    timestamp: '2 hours ago',
    mutual: true
  }
];

// Mock current user for profile screen
export const mockCurrentUser: CurrentUser = {
  id: 'current',
  name: 'Jordan',
  age: 29,
  location: 'Boston, MA',
  about: 'Basketball enthusiast and amateur chef. Looking for someone to share adventures and good food with. When I\'m not on the court, you can find me trying new recipes or exploring the city.',
  photos: [
    'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
    'https://images.pexels.com/photos/1157455/pexels-photo-1157455.jpeg',
    'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg'
  ],
  prompts: [
    {
      question: 'My simple pleasures...',
      answer: 'A perfect jump shot, Sunday morning coffee, and finding new music.'
    },
    {
      question: 'You should not go out with me if...',
      answer: 'You don\'t appreciate dad jokes or have strong opinions about pizza toppings.'
    },
    {
      question: 'My most irrational fear...',
      answer: 'Forgetting my own phone number during an important call.'
    }
  ]
};