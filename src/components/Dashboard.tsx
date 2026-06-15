import { Layers, BookOpen, Clock, TrendingUp, ArrowRight, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import type { ViewType, Flashcard, Note, StudySession } from "../App";

interface DashboardProps {
  flashcards: Flashcard[];
  notes: Note[];
  studySessions: StudySession[];
  setCurrentView: (view: ViewType) => void;
}

export function Dashboard({ flashcards, notes, studySessions, setCurrentView }: DashboardProps) {
  const totalStudyTime = studySessions.reduce((acc, session) => acc + session.duration, 0);
  const avgSessionTime = studySessions.length > 0 ? Math.round(totalStudyTime / studySessions.length) : 0;
  const cardsDue = flashcards.filter((card) => !card.lastReviewed || card.confidence !== "high").length;

  // Calculate real weekly progress
  const weeklyGoalMinutes = 150; // 2.5 hours per week goal
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const thisWeekSessions = studySessions.filter((session) => session.date >= startOfWeek);
  const thisWeekMinutes = thisWeekSessions.reduce((acc, session) => acc + session.duration, 0);
  const weeklyProgressPercent = Math.min(Math.round((thisWeekMinutes / weeklyGoalMinutes) * 100), 100);

  // Calculate last week's progress for comparison
  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(startOfWeek);
  
  const lastWeekSessions = studySessions.filter(
    (session) => session.date >= lastWeekStart && session.date < lastWeekEnd
  );
  const lastWeekMinutes = lastWeekSessions.reduce((acc, session) => acc + session.duration, 0);
  
  const percentChange = lastWeekMinutes > 0 
    ? Math.round(((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100)
    : (thisWeekMinutes > 0 ? 100 : 0);

  const quickActions = [
    { label: "Review Cards", icon: Layers, count: cardsDue, color: "bg-amber-500", view: "flashcards" as ViewType },
    { label: "Quick Note", icon: BookOpen, count: notes.length, color: "bg-emerald-500", view: "notes" as ViewType },
    { label: "Start Timer", icon: Clock, count: null, color: "bg-violet-500", view: "timer" as ViewType },
  ];

  const recentActivity = studySessions.slice(-3).reverse();

  const getTrendIcon = () => {
    if (percentChange > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (percentChange < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendText = () => {
    if (thisWeekMinutes === 0 && lastWeekMinutes === 0) {
      return { text: "Start studying to track progress", color: "text-slate-400" };
    }
    if (percentChange > 0) {
      return { text: `+${percentChange}% from last week`, color: "text-emerald-400" };
    }
    if (percentChange < 0) {
      return { text: `${percentChange}% from last week`, color: "text-red-400" };
    }
    return { text: "Same as last week", color: "text-slate-400" };
  };

  const trend = getTrendText();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-indigo-600 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back! 👋</h2>
        <p className="text-indigo-100 mb-4">
          {flashcards.length === 0 
            ? "Start by creating some flashcards to study!"
            : `You have ${cardsDue} cards due for review today.`
          }
        </p>
        <Button
          onClick={() => setCurrentView("flashcards")}
          className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold"
        >
          {flashcards.length === 0 ? "Create Cards" : "Start Studying"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              onClick={() => setCurrentView(action.view)}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left"
            >
              <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-slate-800 text-sm">{action.label}</p>
              {action.count !== null && (
                <p className="text-xs text-slate-600 mt-1">{action.count} items</p>
              )}
            </button>
          );
        })}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-slate-200 bg-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 font-medium">Total Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{totalStudyTime}</span>
              <span className="text-slate-400 text-sm mb-1">minutes</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-300 font-medium">Avg. Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{avgSessionTime}</span>
              <span className="text-slate-400 text-sm mb-1">minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Card */}
      <Card className="border-slate-200 bg-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Weekly Progress</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView("progress")}
              className="text-indigo-400 hover:text-indigo-300 hover:bg-slate-700"
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getTrendIcon()}
                <span className={`text-sm font-medium ${trend.color}`}>{trend.text}</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${weeklyProgressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {thisWeekMinutes} / {weeklyGoalMinutes} minutes this week
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{weeklyProgressPercent}%</div>
              <div className="text-xs text-slate-400">Goal Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-800">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-600 mb-2">No recent activity</p>
              <p className="text-xs text-slate-500">Start a study session to see your progress here</p>
            </div>
          ) : (
            recentActivity.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-800 text-sm">
                    {session.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                  <p className="text-xs text-slate-600">
                    {session.cardsReviewed} cards • {session.notesCreated} notes
                  </p>
                </div>
                <div className="bg-slate-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-slate-700">{session.duration}m</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}