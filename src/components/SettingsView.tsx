import { useState } from "react";
import { User, LogOut, Trash2, Sun, Moon, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useTheme } from "../context/ThemeContext";
import { updateUserProfile, deleteAccount } from "../utils/auth";
import { saveUserData } from "../utils/storage";
import type { UserSettings } from "../types";

interface SettingsViewProps {
  user: { id: string; email: string; name: string };
  setUser: (user: { id: string; email: string; name: string } | null) => void;
  settings: UserSettings;
  setSettings: React.Dispatch<React.SetStateAction<UserSettings>>;
  onLogout: () => void;
}

export function SettingsView({ user, setUser, settings, setSettings, onLogout }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user.name);
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSaveProfile = () => {
    setIsSaving(true);
    
    const result = updateUserProfile(user.id, { name });
    
    if (result.success) {
      setUser({ ...user, name });
      setSettings({ ...settings, name, dailyGoal });
      saveUserData(user.id, "settings", { ...settings, name, dailyGoal });
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(result.error || "Failed to update profile");
    }
    
    setIsSaving(false);
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.")) {
      if (confirm("This is your last chance. Type 'DELETE' to confirm.")) {
        deleteAccount(user.id);
        onLogout();
      }
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: newTheme }));
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="border-slate-200 dark:border-slate-700 mb-6 bg-white dark:bg-slate-800 transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-white">
            <User className="w-5 h-5 text-violet-500" />
            Profile
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyGoal" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Target className="w-4 h-4 text-violet-500" />
              Daily Study Goal (minutes)
            </Label>
            <Input
              id="dailyGoal"
              type="number"
              min="5"
              max="480"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value) || 60)}
              className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white"
            />
          </div>
          
          {message && (
            <div className={`p-3 rounded-lg ${
              message.includes("success") 
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            }`}>
              {message}
            </div>
          )}

          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-violet-500 hover:bg-violet-600"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Theme Section */}
      <Card className="border-slate-200 dark:border-slate-700 mb-6 bg-white dark:bg-slate-800 transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800 dark:text-white">
            {theme === "dark" ? <Moon className="w-5 h-5 text-violet-500" /> : <Sun className="w-5 h-5 text-violet-500" />}
            Appearance
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Choose your preferred theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleThemeChange("light")}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === "light"
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-600" />
                </div>
                <span className="font-medium text-slate-800 dark:text-white">Light</span>
                {theme === "light" && (
                  <div className="w-2 h-2 bg-violet-500 rounded-full" />
                )}
              </div>
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === "dark"
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/30"
                  : "border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Moon className="w-6 h-6 text-slate-200" />
                </div>
                <span className="font-medium text-slate-800 dark:text-white">Dark</span>
                {theme === "dark" && (
                  <div className="w-2 h-2 bg-violet-500 rounded-full" />
                )}
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900 bg-white dark:bg-slate-800 transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Irreversible actions for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Delete Account</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete your account and all data</p>
            </div>
            <Button
              onClick={handleDeleteAccount}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Delete
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800 dark:text-white">Sign Out</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sign out of your account</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}