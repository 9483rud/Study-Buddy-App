import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import type { StudySession } from "../types";

interface TimerViewProps {
  studySessions: StudySession[];
  setStudySessions: React.Dispatch<React.SetStateAction<StudySession[]>>;
}

export function TimerView({ studySessions, setStudySessions }: TimerViewProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { label: "Pomodoro", minutes: 25, color: "bg-red-500" },
    { label: "Short Break", minutes: 5, color: "bg-emerald-500" },
    { label: "Long Break", minutes: 15, color: "bg-blue-500" },
    { label: "Deep Focus", minutes: 50, color: "bg-violet-500" },
  ];

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    if (time > 0) {
      // Save session
      const newSession: StudySession = {
        id: Date.now().toString(),
        date: new Date(),
        duration: Math.floor(time / 60),
        cardsReviewed: 0,
        notesCreated: 0,
      };
      setStudySessions([...studySessions, newSession]);
    }
    setIsRunning(false);
    setTime(0);
    setSelectedPreset(null);
  };

  const handlePreset = (minutes: number) => {
    setTime(minutes * 60);
    setSelectedPreset(minutes);
    setIsRunning(false);
  };

  const totalSeconds = selectedPreset ? selectedPreset * 60 : time;
  const progress = selectedPreset ? ((selectedPreset * 60 - time) / (selectedPreset * 60)) * 100 : 0;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Study Timer</h1>

        {/* Timer Display */}
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-6">
          <CardContent className="p-8">
            <div className="relative flex items-center justify-center">
              {/* Progress ring for presets */}
              {selectedPreset && (
                <svg className="absolute w-48 h-48 md:w-56 md:h-56 -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-slate-200 dark:text-slate-700"
                  />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="45%"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${progress * 2.83} 283`}
                    className="text-violet-500 transition-all duration-1000"
                  />
                </svg>
              )}
              <div className="text-5xl md:text-6xl font-mono font-bold text-slate-800 dark:text-white tabular-nums">
                {formatTime(time)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <div className="flex justify-center gap-3 mb-6">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="bg-emerald-500 hover:bg-emerald-600 min-h-14 min-w-14 md:min-w-32"
            >
              <Play className="w-6 h-6 md:mr-2" />
              <span className="hidden md:inline">Start</span>
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              className="bg-amber-500 hover:bg-amber-600 min-h-14 min-w-14 md:min-w-32"
            >
              <Pause className="w-6 h-6 md:mr-2" />
              <span className="hidden md:inline">Pause</span>
            </Button>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 min-h-14 min-w-14 md:min-w-32"
          >
            <RotateCw className="w-6 h-6 md:mr-2" />
            <span className="hidden md:inline">Reset</span>
          </Button>
        </div>

        {/* Presets */}
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handlePreset(preset.minutes)}
              className={`p-4 rounded-xl text-white font-medium transition-all touch-manipulation min-h-16 ${
                selectedPreset === preset.minutes
                  ? `${preset.color} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-white/50 scale-105`
                  : `${preset.color} opacity-80 hover:opacity-100 active:scale-95`
              }`}
            >
              <div className="text-base font-semibold">{preset.label}</div>
              <div className="text-sm opacity-90">{preset.minutes} min</div>
            </button>
          ))}
        </div>

        {/* Today's Sessions */}
        {studySessions.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-slate-800 dark:text-white">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {studySessions.slice(-5).reverse().map((session) => (
                  <div
                    key={session.id}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      {session.duration} minutes
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}