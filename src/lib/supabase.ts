import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions
export interface FlashcardRow {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  category: string;
  subcategory: string | null;
  difficulty: string;
  times_reviewed: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review_date: string;
  last_review_grade: number | null;
}

export interface FlashcardInsert {
  user_id: string;
  question: string;
  answer: string;
  category?: string;
  subcategory?: string | null;
  difficulty?: string;
  ease_factor?: number;
  interval_days?: number;
  repetitions?: number;
  next_review_date?: string;
}

export interface FlashcardUpdate {
  question?: string;
  answer?: string;
  category?: string;
  subcategory?: string | null;
  difficulty?: string;
  times_reviewed?: number;
  last_reviewed_at?: string | null;
  ease_factor?: number;
  interval_days?: number;
  repetitions?: number;
  next_review_date?: string;
  last_review_grade?: number;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface NoteRow {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface TodoRow {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  priority: string;
  due_date: string | null;
  created_at: string;
}

export interface StudySessionRow {
  id: string;
  user_id: string;
  duration_minutes: number;
  cards_reviewed: number;
  notes_created: number;
  created_at: string;
}
