export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  subcategory: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  timesReviewed: number;
  lastReviewedAt: string | null;
  createdAt: string;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewGrade: number | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null;
  createdAt: string;
}

export interface StudySession {
  id: string;
  date: string;
  duration: number;
  cardsReviewed: number;
  notesCreated: number;
}

export type Theme = 'light' | 'dark';

export interface AppSettings {
  theme: Theme;
  pomodoroLength: number;
  shortBreakLength: number;
  longBreakLength: number;
  dailyGoal: number;
}
