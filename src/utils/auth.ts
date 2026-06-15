// Simple auth utility using localStorage

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

const USERS_KEY = "studyapp_users";
const SESSION_KEY = "studyapp_session";

// Simple hash function for passwords (not cryptographically secure, but works for demo)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36) + str.length.toString(36);
}

function getUsers(): User[] {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function signUp(email: string, password: string, name: string): { success: boolean; error?: string; user?: Session } {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Validate password
  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" };
  }

  // Create new user
  const newUser: User = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    email: email.toLowerCase(),
    name: name.trim(),
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Create session
  const session: Session = {
    userId: newUser.id,
    email: newUser.email,
    name: newUser.name,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  return { success: true, user: session };
}

export function signIn(email: string, password: string): { success: boolean; error?: string; user?: Session } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, error: "No account found with this email" };
  }

  if (user.passwordHash !== simpleHash(password)) {
    return { success: false, error: "Incorrect password" };
  }

  // Create session
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
  return { success: true, user: session };
}

export function getSession(): Session | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    const session: Session = JSON.parse(stored);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function updateUserProfile(userId: string, updates: { name?: string; email?: string }): { success: boolean; error?: string } {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return { success: false, error: "User not found" };
  }

  if (updates.email && updates.email !== users[userIndex].email) {
    // Check if new email is already taken
    if (users.find(u => u.id !== userId && u.email.toLowerCase() === updates.email!.toLowerCase())) {
      return { success: false, error: "Email is already in use" };
    }
  }

  users[userIndex] = {
    ...users[userIndex],
    ...(updates.name && { name: updates.name }),
    ...(updates.email && { email: updates.email.toLowerCase() }),
  };

  saveUsers(users);

  // Update session
  const session = getSession();
  if (session) {
    const updatedSession: Session = {
      ...session,
      ...(updates.name && { name: updates.name }),
      ...(updates.email && { email: updates.email }),
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
  }

  return { success: true };
}

export function deleteAccount(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  saveUsers(users);
  localStorage.removeItem(SESSION_KEY);
  
  // Clear all user data
  localStorage.removeItem(`flashcards_${userId}`);
  localStorage.removeItem(`notes_${userId}`);
  localStorage.removeItem(`sessions_${userId}`);
  localStorage.removeItem(`settings_${userId}`);
}
