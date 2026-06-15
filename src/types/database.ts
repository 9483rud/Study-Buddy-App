export interface DatabaseFlashcard {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  category: string;
  confidence: string;
  last_reviewed: string | null;
  created_at: string;
}

export interface DatabaseNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseStudySession {
  id: string;
  user_id: string;
  date: string;
  duration: number;
  cards_reviewed: number;
  notes_created: number;
}

export interface DatabaseUserSettings {
  id: string;
  user_id: string;
  name: string;
  daily_goal: number;
  theme: string;
}