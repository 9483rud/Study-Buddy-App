import { useState, useEffect } from 'react';
import { Home, BookOpen, FileText, CheckSquare, Clock, Settings as SettingsIcon, Menu, X, Sun, Moon, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { FlashcardsView } from './components/FlashcardsView';
import { NotesView } from './components/NotesView';
import { TimerView } from './components/TimerView';
import { TodosView } from './components/TodosView';
import { SettingsView } from './components/SettingsView';
import { CoursesView } from './components/CoursesView';
import { HomeView } from './components/HomeView';
import { GetStartedModal } from './components/GetStartedModal';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { ThemeProvider, useTheme } from './context/ThemeContext';

export type View = 'home' | 'courses' | 'flashcards' | 'notes' | 'timer' | 'todos' | 'settings';

const STORAGE_KEYS = {
  flashcards: 'studybuddy_flashcards',
  notes: 'studybuddy_notes',
  todos: 'studybuddy_todos',
  courses: 'studybuddy_courses',
};

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [startCreatingFlashcard, setStartCreatingFlashcard] = useState(false);
  const [startCreatingCourse, setStartCreatingCourse] = useState(false);
  const [startCreatingNote, setStartCreatingNote] = useState(false);
  const [startCreatingTask, setStartCreatingTask] = useState(false);
  const { theme, setTheme } = useTheme();
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    const checkData = () => {
      const flashcards = localStorage.getItem(STORAGE_KEYS.flashcards);
      const notes = localStorage.getItem(STORAGE_KEYS.notes);
      const todos = localStorage.getItem(STORAGE_KEYS.todos);
      const courses = localStorage.getItem(STORAGE_KEYS.courses);
      
      const hasAnyData = 
        (flashcards && JSON.parse(flashcards).length > 0) ||
        (notes && JSON.parse(notes).length > 0) ||
        (todos && JSON.parse(todos).length > 0) ||
        (courses && JSON.parse(courses).length > 0);
      
      setHasData(hasAnyData);
    };
    
    checkData();
    
    const handleStorageChange = () => checkData();
    window.addEventListener('storage', handleStorageChange);
    
    const interval = setInterval(checkData, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { id: 'home' as View, label: 'Home', icon: Home },
    { id: 'courses' as View, label: 'Courses', icon: GraduationCap },
    { id: 'flashcards' as View, label: 'Flashcards', icon: BookOpen },
    { id: 'notes' as View, label: 'Notes', icon: FileText },
    { id: 'todos' as View, label: 'Tasks', icon: CheckSquare },
    { id: 'timer' as View, label: 'Timer', icon: Clock },
    { id: 'settings' as View, label: 'Settings', icon: SettingsIcon },
  ];

  const handleSelectOption = (view: View) => {
    setCurrentView(view);
    setShowGetStartedModal(false);
    if (view === 'flashcards') {
      setStartCreatingFlashcard(true);
    } else if (view === 'courses') {
      setStartCreatingCourse(true);
    } else if (view === 'notes') {
      setStartCreatingNote(true);
    } else if (view === 'todos') {
      setStartCreatingTask(true);
    }
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setStartCreatingFlashcard(false);
    setStartCreatingCourse(false);
    setStartCreatingNote(false);
    setStartCreatingTask(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'courses':
        return <CoursesView onNavigate={setCurrentView} startCreating={startCreatingCourse} />;
      case 'flashcards':
        return <FlashcardsView startCreating={startCreatingFlashcard} />;
      case 'notes':
        return <NotesView startCreating={startCreatingNote} />;
      case 'timer':
        return <TimerView />;
      case 'todos':
        return <TodosView startCreating={startCreatingTask} />;
      case 'settings':
        return <SettingsView />;
      default:
        return (
          <HomeView 
            onNavigate={handleNavigate} 
            onGetStarted={() => setShowGetStartedModal(true)} 
            hasData={hasData} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <MobileHeader 
        onMenuClick={() => setSidebarOpen(true)}
        theme={theme}
        onThemeChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        navItems={navItems}
        currentView={currentView}
        sidebarOpen={sidebarOpen}
        sidebarCollapsed={sidebarCollapsed}
        theme={theme}
        onNavigate={(view) => { handleNavigate(view); setSidebarOpen(false); }}
        onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
        onThemeChange={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />

      <main className={`pt-16 lg:pt-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56'}`}>
        {renderView()}
      </main>

      <GetStartedModal
        isOpen={showGetStartedModal}
        onClose={() => setShowGetStartedModal(false)}
        onSelectOption={handleSelectOption}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
