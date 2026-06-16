import type { Flashcard, Note, Todo, StudySession, AppSettings } from '../types';

const KEYS = {
  FLASHCARDS: 'studyapp_flashcards',
  NOTES: 'studyapp_notes',
  TODOS: 'studyapp_todos',
  SESSIONS: 'studyapp_sessions',
  SETTINGS: 'studyapp_settings',
};

const defaultSettings: AppSettings = {
  theme: 'light',
  pomodoroLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  dailyGoal: 30,
};

function safeJsonParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function getFlashcards(): Flashcard[] {
  return safeJsonParse<Flashcard[]>(localStorage.getItem(KEYS.FLASHCARDS), []);
}

export function saveFlashcards(cards: Flashcard[]): void {
  localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
}

export function getNotes(): Note[] {
  return safeJsonParse<Note[]>(localStorage.getItem(KEYS.NOTES), []);
}

export function saveNotes(notes: Note[]): void {
  localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
}

export function getTodos(): Todo[] {
  return safeJsonParse<Todo[]>(localStorage.getItem(KEYS.TODOS), []);
}

export function saveTodos(todos: Todo[]): void {
  localStorage.setItem(KEYS.TODOS, JSON.stringify(todos));
}

export function getStudySessions(): StudySession[] {
  return safeJsonParse<StudySession[]>(localStorage.getItem(KEYS.SESSIONS), []);
}

export function saveStudySessions(sessions: StudySession[]): void {
  localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

export function getSettings(): AppSettings {
  return safeJsonParse<AppSettings>(localStorage.getItem(KEYS.SETTINGS), defaultSettings);
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
