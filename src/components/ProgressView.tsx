import { BarChart2, Clock, BookOpen, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import type { StudySession, Flashcard } from "../App";

interface ProgressViewProps {
  studySessions: StudySession[];
  flashcards: Flashcard[];
}

export function ProgressView({ studySessions, flashcards }: ProgressViewProps) {
  const totalStudyTime = studySessions.reduce((acc, s) => acc + s.duration, 0);
  const avgSessionTime = studySessions.length > 0 ? Math.round(totalStudyTime / studySessions.length) : 0;
  const cardsReviewed = flashcards.filter((f) => f.lastReviewed).length;
  const highConfidence = flashcards.filter((f) => f.confidence === "high").length;

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toDateString();
  });

  const weeklyData = last7Days.map((day) => {
    const sessions = studySessions.filter((s) => new Date(s.date).toDateString() === day);
    return {
      day: new Date(day).toLocaleDateString("en-US", { weekday: "short" }),
      minutes: sessions.reduce((acc, s) => acc + s.duration, 0),
    };
  });

  const maxMinutes = Math.max(...weeklyData.map((d) => d.minutes), 1);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Progress</h1>
        <p className="text-slate-500 mt-1">Track your study journey</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <Clock className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{totalStudyTime}</p>
                <p className="text-sm text-slate-500">Total minutes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{avgSessionTime}</p>
                <p className="text-sm text-slate-500">Avg session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{cardsReviewed}</p>
                <p className="text-sm text-slate-500">Cards reviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{highConfidence}</p>
                <p className="text-sm text-slate-500">Mastered cards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="border-slate-200 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Weekly Activity</CardTitle>
          <CardDescription>Minutes studied per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-40 gap-2">
            {weeklyData.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-violet-500 rounded-t-sm transition-all"
                  style={{
                    height: `${(data.minutes / maxMinutes) * 100}%`,
                    minHeight: data.minutes > 0 ? "8px" : "2px",
                  }}
                />
                <p className="text-xs text-slate-500 mt-2">{data.day}</p>
                <p className="text-xs text-slate-400">{data.minutes}m</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Progress */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Flashcard Mastery</CardTitle>
          <CardDescription>Confidence level distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">High confidence</span>
                <span className="text-sm font-medium text-emerald-600">
                  {flashcards.filter((f) => f.confidence === "high").length}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${
                      flashcards.length > 0
                        ? (flashcards.filter((f) => f.confidence === "high").length /
                            flashcards.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Medium confidence</span>
                <span className="text-sm font-medium text-amber-600">
                  {flashcards.filter((f) => f.confidence === "medium").length}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{
                    width: `${
                      flashcards.length > 0
                        ? (flashcards.filter((f) => f.confidence === "medium").length /
                            flashcards.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Low confidence</span>
                <span className="text-sm font-medium text-red-600">
                  {flashcards.filter((f) => f.confidence === "low").length}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${
                      flashcards.length > 0
                        ? (flashcards.filter((f) => f.confidence === "low").length /
                            flashcards.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}