import { useState } from "react";
import { BookOpen, ArrowRight, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { signUp, signIn } from "../utils/auth";
import type { User } from "../types";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    if (isSignUp && !name.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (isSignUp) {
      const result = signUp(email, password, name);
      if (result.success && result.user) {
        onLogin({
          id: result.user.userId,
          email: result.user.email,
          name: result.user.name,
        });
      } else {
        setError(result.error || "Failed to create account");
      }
    } else {
      const result = signIn(email, password);
      if (result.success && result.user) {
        onLogin({
          id: result.user.userId,
          email: result.user.email,
          name: result.user.name,
        });
      } else {
        setError(result.error || "Failed to sign in");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-violet-600 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-violet-500 dark:bg-violet-600 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-400 dark:bg-violet-500 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500 dark:bg-violet-700 rounded-full opacity-10 blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-0 shadow-2xl bg-white dark:bg-slate-800 transition-colors duration-300">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            {isSignUp
              ? "Sign up to start your learning journey"
              : "Sign in to continue your studies"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="grid grid-cols-3 gap-3 py-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Flashcards</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Notes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Timer</p>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Your Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">Minimum 6 characters</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-violet-500 hover:bg-violet-600 text-white gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? "Create Account" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
              className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </button>
          </div>

          <p className="text-xs text-center text-slate-400 dark:text-slate-500">
            Your data is stored locally in your browser
          </p>
        </CardContent>
      </Card>
    </div>
  );
}