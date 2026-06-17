import { X, GraduationCap, BookOpen, FileText, CheckSquare } from 'lucide-react';
import type { View } from '../App';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (view: View) => void;
}

export function GetStartedModal({ isOpen, onClose, onSelectOption }: GetStartedModalProps) {
  if (!isOpen) return null;

  const options = [
    { view: 'courses' as View, icon: GraduationCap, label: 'Create Course', description: 'Organize your studies by subject', color: 'bg-rose-500', hoverColor: 'hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-600' },
    { view: 'flashcards' as View, icon: BookOpen, label: 'Create Flashcard', description: 'Start learning with spaced repetition', color: 'bg-violet-500', hoverColor: 'hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 dark:hover:border-violet-600' },
    { view: 'notes' as View, icon: FileText, label: 'Create Note', description: 'Organize your thoughts and ideas', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600' },
    { view: 'todos' as View, icon: CheckSquare, label: 'Create Task', description: 'Track your study progress', color: 'bg-emerald-500', hoverColor: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full p-5 border border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Get Started</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">What would you like to create first?</p>
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.view}
              onClick={() => onSelectOption(option.view)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 ${option.hoverColor} transition-colors group`}
            >
              <div className={`p-2 ${option.color} rounded-lg`}>
                <option.icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {option.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
