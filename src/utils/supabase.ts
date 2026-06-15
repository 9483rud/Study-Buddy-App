import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pliqxequconpjrpcjqxj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsaXF4ZXF1Y29ucGpycGNqcXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE1Mjk4NjAsImV4cCI6MjA5NzEwNTg2MH0.6bE9JiMIxTnVnYF-2QDEfNmAD1S2JWxYdQqfYMVEKCg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Flashcards
export async function getFlashcards(userId: string) {
  const { data, error } = await supabase
    .from("flashcards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function createFlashcard(userId: string, card: { question: string; answer: string; category: string }) {
  const { data, error } = await supabase
    .from("flashcards")
    .insert([{ ...card, user_id: userId }])
    .select()
    .single();
  return { data, error };
}

export async function updateFlashcard(id: string, updates: Partial<{ question: string; answer: string; category: string; confidence: string; last_reviewed: string }>) {
  const { data, error } = await supabase
    .from("flashcards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteFlashcard(id: string) {
  const { error } = await supabase
    .from("flashcards")
    .delete()
    .eq("id", id);
  return { error };
}

// Notes
export async function getNotes(userId: string) {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return { data, error };
}

export async function createNote(userId: string, note: { title: string; content: string; category: string }) {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ ...note, user_id: userId }])
    .select()
    .single();
  return { data, error };
}

export async function updateNote(id: string, updates: Partial<{ title: string; content: string; category: string }>) {
  const { data, error } = await supabase
    .from("notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deleteNote(id: string) {
  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id);
  return { error };
}

// Study Sessions
export async function getStudySessions(userId: string) {
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  return { data, error };
}

export async function createStudySession(userId: string, session: { duration: number; cards_reviewed: number; notes_created: number }) {
  const { data, error } = await supabase
    .from("study_sessions")
    .insert([{ ...session, user_id: userId, date: new Date().toISOString() }])
    .select()
    .single();
  return { data, error };
}

// User Settings
export async function getUserSettings(userId: string) {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();
  return { data, error };
}

export async function upsertUserSettings(userId: string, settings: { name: string; daily_goal: number; theme: string }) {
  const { data, error } = await supabase
    .from("user_settings")
    .upsert([{ user_id: userId, ...settings }])
    .select()
    .single();
  return { data, error };
}