import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useTheme } from '../context/ThemeContext';
import { getSettings, saveSettings } from '../utils/storage';
import type { AppSettings } from '../types';

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    pomodoroLength: 25,
    shortBreakLength: 5,
    longBreakLength: 15,
    dailyGoal: 30,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
  }, []);

  const handleSave = () => {
    setSaving(true);
    saveSettings(settings);
    setSaving(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Settings</h1>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-white">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                  theme === 'light' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sun className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-300" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Light</p>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 p-4 rounded-xl border-2 transition-colors ${
                  theme === 'dark' ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <Moon className="w-6 h-6 mx-auto mb-2 text-slate-600 dark:text-slate-300" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dark</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-6">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-white">Timer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Pomodoro Length (minutes)</Label>
              <Input
                type="number"
                value={settings.pomodoroLength}
                onChange={(e) => setSettings({ ...settings, pomodoroLength: parseInt(e.target.value) || 25 })}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Short Break Length (minutes)</Label>
              <Input
                type="number"
                value={settings.shortBreakLength}
                onChange={(e) => setSettings({ ...settings, shortBreakLength: parseInt(e.target.value) || 5 })}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Long Break Length (minutes)</Label>
              <Input
                type="number"
                value={settings.longBreakLength}
                onChange={(e) => setSettings({ ...settings, longBreakLength: parseInt(e.target.value) || 15 })}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-12"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Daily Study Goal (minutes)</Label>
              <Input
                type="number"
                value={settings.dailyGoal}
                onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) || 30 })}
                className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-violet-500 hover:bg-violet-600 min-h-12">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
