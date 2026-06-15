export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory?: string;
  createdAt: Date;
  lastReviewed?: Date;
  timesReviewed: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySession {
  id: string;
  date: Date;
  duration: number;
  cardsReviewed: number;
  notesCreated: number;
}

export interface UserSettings {
  name: string;
  dailyGoal: number;
  theme: "light" | "dark";
}
