export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  subCategory?: string;
  reporter: string;
  imageUrl: string;
  summary: string;
  content: string;
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  createdAt: string; // ISO string
  tags: string[];
  readingTimeMinutes?: number;
}

export interface GazipurWeather {
  temp: number;
  condition: string;
  bengaliCondition: string;
  humidity: number;
  windSpeed: number;
  airQuality: string;
  highTemp: number;
  lowTemp: number;
  city: string;
}

export interface HelplineItem {
  id: string;
  name: string;
  bengaliName: string;
  number: string;
  category: 'police' | 'hospital' | 'fire' | 'national' | 'administration';
  available: string;
}

export interface ReaderPoll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  source: string;
  status: 'active' | 'unsubscribed';
}
