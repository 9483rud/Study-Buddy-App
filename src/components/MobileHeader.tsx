import { Menu, Sun, Moon } from 'lucide-react';

interface MobileHeaderProps {
  onMenuClick: () => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

export function MobileHeader({ onMenuClick, theme, onThemeChange }: MobileHeaderProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <button onClick={onMenuClick} className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold text-slate-800 dark:text-white">Study Buddy App</h1>
        <button onClick={onThemeChange} className="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
