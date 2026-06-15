import { BookOpen, FileText, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import type { Flashcard, Note, StudySession } from "../types";

interface DashboardViewProps {
  flashcards: Flashcard[];
  notes: Note[];
  studySessions: StudySession[];
  setActiveTab: (tab: string) => void;
}

export function DashboardView({ flashcards, notes, studySessions, setActiveTab }: DashboardViewProps) {
  const todaySessions = studySessions.filter(
    (s) => new Date(s.date).toDateString() === new Date().toDateString()
  );
  
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalCards = flashcards.length;
  const totalNotes = notes.length;
  
  const cardsToReview = flashcards.filter(
    (c) => !c.lastReviewed || new Date(c.lastReviewed) < new Date(Date.now() - 24 * 60 * 60 * 1000)
  ).length;

  const stats = [
    {
      label: "Study Time Today",
      value: `${todayMinutes}m`,
      icon: Clock,
      color: "bg-blue-100 dark:bg-blue-900/50",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Flashcards",
      value: totalCards,
      icon: BookOpen,
      color: "bg-amber-100 dark:bg-amber-900/50",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Notes",
      value: totalNotes,
      icon: FileText,
      color: "bg-emerald-100 dark:bg-emerald-900/50",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Cards to Review",
      value: cardsToReview,
      icon: TrendingUp,
      color: "bg-violet-100 dark:bg-violet-900/50",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome back!</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Here's your study overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
              <CardContent className="p-4">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card 
          className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300"
          onClick={() => setActiveTab("flashcards")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Study Flashcards</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {cardsToReview > 0 ? `${cardsToReview} cards need review` : "All caught up!"}
                </p>
              </div>
              <Button className="bg-violet-500 hover:bg-violet-600 gap-2">
                Start
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-all duration-300"
          onClick={() => setActiveTab("timer")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">Start Study Session</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Use the Pomodoro timer
                </p>
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600 gap-2">
                Start
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {studySessions.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Activity</h2>
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-colors duration-300">
            <CardContent className="p-4">
              <div className="space-y-3">
                {studySessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/50 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">
                          {session.duration} minutes
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {new Date(session.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {session.cardsReviewed} cards
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}