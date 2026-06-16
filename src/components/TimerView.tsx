import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCw, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { getStudySessions, saveStudySessions, generateId } from '../utils/storage';
import type { StudySession } from '../types';

export function TimerView() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { label: 'Pomodoro', minutes: 25, color: 'bg-red-500' },
    { label: 'Short Break', minutes: 5, color: 'bg-emerald-500' },
    { label: 'Long Break', minutes: 15, color: 'bg-blue-500' },
    { label: 'Deep Focus', minutes: 50, color: 'bg-violet-500' },
  ];

  useEffect(() => {
    const sessions = getStudySessions();
    setStudySessions(sessions);
  }, []);

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
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    if (time > 0) {
      const newSession: StudySession = {
        id: generateId(),
        date: new Date().toISOString(),
        duration: Math.floor(time / 60),
        cardsReviewed: 0,
        notesCreated: 0,
      };
      const updatedSessions = [...studySessions, newSession];
      setStudySessions(updatedSessions);
      saveStudySessions(updatedSessions);
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

  const totalMinutesToday = studySessions
    .filter((s) => new Date(s.date).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Study Timer</h1>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-6">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="text-6xl md:text-8xl font-mono font-bold text-slate-800 dark:text-white mb-8">
                {formatTime(time)}
              </div>

              <div className="flex justify-center gap-4 mb-8">
                {!isRunning ? (
                  <Button onClick={handleStart} className="bg-emerald-500 hover:bg-emerald-600 min-h-14 px-8">
                    <Play className="w-6 h-6 mr-2" /> Start
                  </Button>
                ) : (
                  <Button onClick={handlePause} className="bg-amber-500 hover:bg-amber-600 min-h-14 px-8">
                    <Pause className="w-6 h-6 mr-2" /> Pause
                  </Button>
                )}
                <Button onClick={handleReset} variant="outline" className="border-slate-300 dark:border-slate-600 min-h-14 px-8">
                  <RotateCw className="w-6 h-6 mr-2" /> Reset
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.minutes}
                    onClick={() => handlePreset(preset.minutes)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedPreset === preset.minutes
                        ? `${preset.color} text-white`
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {preset.label} ({preset.minutes}m)
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5" /> Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-violet-500 mb-2">{totalMinutesToday} minutes</div>
            <p className="text-slate-500 dark:text-slate-400">Total study time today</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
