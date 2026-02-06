export type Language = 'en' | 'ru';

export interface Suspect {
  id: string;
  name: string;
  role: string; // e.g. "The Butler", "The Business Partner"
  bio: string;
  motive: string;
  alibi: string;
  isKiller: boolean;
  avatarSeed: string; // For generating an icon
}

export interface CrimeCase {
  id: string;
  title: string;
  description: string;
  location: string;
  victim: string;
  timeOfDeath: string;
  clues: string[];
  suspects: Suspect[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ChatMessage {
  id: string;
  sender: 'Detective' | 'Suspect';
  text: string;
  timestamp: number;
}

export enum GameView {
  OFFICE = 'OFFICE',
  CASE_FILE = 'CASE_FILE',
  INTERROGATION = 'INTERROGATION',
  ACCUSATION = 'ACCUSATION',
  RESULT = 'RESULT',
  SHOP = 'SHOP'
}