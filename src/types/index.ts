export interface HairSnapshot {
  id: string;
  imageUri: string;
  timestamp: number;
  notes?: string;
  hairLossScore?: number; // 0-100 score representing hair density, higher = more hair
  areas?: {
    crown?: number;
    hairline?: number;
    overall?: number;
  };
}

export interface UserSettings {
  reminderFrequency: 'daily' | 'twice-daily';
  reminderTimes: {
    morning?: string; // Format: "HH:MM"
    evening?: string; // Format: "HH:MM"
  };
  username?: string;
  notificationsEnabled: boolean;
}

export interface SuggestionType {
  id: string;
  title: string;
  description: string;
  category: 'medical' | 'lifestyle' | 'product' | 'treatment';
  relevantScore: number; // 0-100, how relevant this suggestion is based on user's data
}

export enum ProgressTrend {
  IMPROVING = 'improving',
  STABLE = 'stable',
  DECLINING = 'declining',
  INSUFFICIENT_DATA = 'insufficient_data'
}

export interface ProgressData {
  trend: ProgressTrend;
  percentChange?: number;
  historicalScores: {
    date: string;
    score: number;
  }[];
} 