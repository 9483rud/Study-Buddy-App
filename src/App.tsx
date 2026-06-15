import { useState, useEffect } from "react";
import { Home, BookOpen, FileText, Clock, BarChart2, Settings } from "lucide-react";
import { getSession, signOut } from "./utils/auth";
import { loadUserData } from "./utils/storage";
import { ThemeProvider } from "./context/ThemeContext";
import { DashboardView } from "./components/DashboardView";
import { FlashcardsView } from "./components/FlashcardsView";
import { NotesView } from "./components/NotesView";
import { TimerView } from "./components/TimerView";
import { ProgressView } from "./components/ProgressView";
import { SettingsView } from "./components/SettingsView";
import { LoginPage } from "./components/LoginPage";
import type { Flashcard, Note, StudySession, UserSettings, User } from "./types";

function AppContent({ user, setUser }: { user: User | null; setUser: React.Dispatch<React.SetStateAction<User | null>> }) {
  const [activeTab, setActiveTab] = useState("home");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    name: "",
    dailyGoal: 60,
    theme: "light",
  });

  // Load user data when user changes
  useEffect(() => {
    if (user) {
      setFlashcards(loadUserData<Flashcard[]>(user.id, "flashcards", []));
      setNotes(loadUserData<Note[]>(user.id, "notes", []));
      setStudySessions(loadUserData<StudySession[]>(user.id, "sessions", []));
      setSettings(loadUserData<UserSettings>(user.id, "settings", {
        name: user.name,
        dailyGoal: 60,
        theme: "light",
      }));
    }
  }, [user]);

  const handleLogout = () => {
    signOut();
    setUser(null);
    setFlashcards([]);
    setNotes([]);
    setStudySessions([]);
    setActiveTab("home");
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "flashcards", label: "Cards", icon: BookOpen },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "timer", label: "Timer", icon: Clock },
    { id: "progress", label: "Progress", icon: BarChart2 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    if (!user) return null;
    
    switch (activeTab) {
      case "home":
        return (
          <DashboardView
            flashcards={flashcards}
            notes={notes}
            studySessions={studySessions}
            setActiveTab={setActiveTab}
          />
        );
      case "flashcards":
        return (
          <FlashcardsView
            userId={user.id}
            flashcards={flashcards}
            setFlashcards={setFlashcards}
          />
        );
      case "notes":
        return (
          <NotesView
            userId={user.id}
            notes={notes}
            setNotes={setNotes}
          />
        );
      case "timer":
        return (
          <TimerView
            userId={user.id}
            studySessions={studySessions}
            setStudySessions={setStudySessions}
          />
        );
      case "progress":
        return (
          <ProgressView
            studySessions={studySessions}
            flashcards={flashcards}
          />
        );
      case "settings":
        return (
          <SettingsView
            user={user}
            setUser={setUser}
            settings={settings}
            setSettings={setSettings}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-500 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">StudyHub</h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">Your all-in-one study companion</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:block">
                Welcome, {user.name}
              </span>
              <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-violet-600 dark:text-violet-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-24">
        {user ? renderContent() : <LoginPage onLogin={setUser} />}
      </main>

      {/* Bottom Navigation */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-40 transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-2">
            <div className="flex justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center py-3 px-4 transition-colors ${
                      isActive
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                    <span className="text-xs mt-1 font-medium">{item.label}</span>
                    {isActive && (
                      <div className="w-1 h-1 bg-violet-500 rounded-full mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser({
        id: session.userId,
        email: session.email,
        name: session.name,
      });
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider userId={user?.id || null}>
      <AppContent user={user} setUser={setUser} />
    </ThemeProvider>
  );
}
