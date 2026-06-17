import { GraduationCap, BookOpen, FileText, CheckSquare, Clock } from 'lucide-react';
import type { View } from '../App';

interface HomeViewProps {
  onNavigate: (view: View) => void;
  onGetStarted: () => void;
  hasData: boolean;
}

export function HomeView({ onNavigate, onGetStarted, hasData }: HomeViewProps) {
  const features = [
    { icon: GraduationCap, title: 'Courses', description: 'Organize by subject', color: 'bg-rose-500', view: 'courses' as View },
    { icon: BookOpen, title: 'Flashcards', description: 'Spaced repetition', color: 'bg-violet-500', view: 'flashcards' as View },
    { icon: FileText, title: 'Notes', description: 'Organize thoughts', color: 'bg-blue-500', view: 'notes' as View },
    { icon: CheckSquare, title: 'Tasks', description: 'Track progress', color: 'bg-emerald-500', view: 'todos' as View },
    { icon: Clock, title: 'Timer', description: 'Pomodoro focus', color: 'bg-amber-500', view: 'timer' as View },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Welcome to <span className="text-violet-500">Study Buddy App</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Your all-in-one study companion
          </p>
        </div>

        {!hasData && (
          <div className="mb-5 p-4 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg text-white">
            <h2 className="text-base font-bold mb-1">Start Learning Today</h2>
            <p className="text-violet-100 text-xs mb-3">Create your first course to begin.</p>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 bg-white text-violet-600 font-semibold rounded-md hover:bg-violet-50 transition-colors text-sm"
            >
              Get Started
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {features.map((feature) => (
            <button
              key={feature.title}
              onClick={() => onNavigate(feature.view)}
              className="group p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 text-left"
            >
              <div className={`inline-flex p-2 rounded-md ${feature.color} mb-2`}>
                <feature.icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-violet-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{feature.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
