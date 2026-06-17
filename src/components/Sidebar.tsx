import { ChevronLeft, ChevronRight, X, Sun, Moon } from 'lucide-react';
import type { View } from '../App';

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  navItems: NavItem[];
  currentView: View;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  onNavigate: (view: View) => void;
  onToggleCollapsed: () => void;
  onClose: () => void;
  onThemeChange: () => void;
}

export function Sidebar({
  navItems,
  currentView,
  sidebarOpen,
  sidebarCollapsed,
  theme,
  onNavigate,
  onToggleCollapsed,
  onClose,
  onThemeChange,
}: SidebarProps) {
  return (
    <aside className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-all duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
        {!sidebarCollapsed && (
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Study Buddy App</h2>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapsed}
            className="hidden lg:flex p-1.5 text-slate-400 dark:text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
              currentView === item.id
                ? 'bg-violet-500 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            } ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
      </nav>
      <div className={`absolute bottom-3 ${sidebarCollapsed ? 'left-1 right-1' : 'left-2 right-2'}`}>
        <button
          onClick={onThemeChange}
          className={`hidden lg:flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm ${sidebarCollapsed ? 'justify-center' : ''}`}
          title={sidebarCollapsed ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {!sidebarCollapsed && <span className="font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
        </button>
      </div>
    </aside>
  );
}
