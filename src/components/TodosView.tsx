import { useState, useEffect } from 'react';
import { Plus, Trash, Check, Loader2, X } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getTodos, saveTodos, generateId } from '../utils/storage';
import type { Todo } from '../types';

export function TodosView() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadedTodos = getTodos();
    setTodos(loadedTodos);
    setLoading(false);
  }, []);

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    setSaving(true);

    const todo: Todo = {
      id: generateId(),
      text: newTodo.trim(),
      completed: false,
      priority,
      dueDate: null,
      createdAt: new Date().toISOString(),
    };

    const updatedTodos = [todo, ...todos];
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
    setNewTodo('');
    setPriority('medium');
    setSaving(false);
  };

  const handleToggleTodo = (id: string) => {
    const updatedTodos = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const handleDeleteTodo = (id: string) => {
    const updatedTodos = todos.filter((t) => t.id !== id);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const priorityColors = {
    low: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300',
    medium: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300',
    high: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300',
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Tasks</h1>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                className="flex-1 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 min-h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <div className="flex gap-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 min-h-12"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <Button onClick={handleAddTodo} disabled={saving || !newTodo.trim()} className="bg-violet-500 hover:bg-violet-600 min-h-12 px-4">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {activeTodos.length === 0 && completedTodos.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="p-12 text-center">
              <Check className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No tasks yet. Add your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {activeTodos.length > 0 && (
              <div className="space-y-3 mb-6">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Active ({activeTodos.length})</h2>
                {activeTodos.map((todo) => (
                  <Card key={todo.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-violet-500 transition-colors flex items-center justify-center"
                        />
                        <div className="flex-1">
                          <p className="text-slate-800 dark:text-white">{todo.text}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[todo.priority]}`}>
                            {todo.priority}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteTodo(todo.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {completedTodos.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Completed ({completedTodos.length})</h2>
                {completedTodos.map((todo) => (
                  <Card key={todo.id} className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTodo(todo.id)}
                          className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <p className="flex-1 text-slate-500 dark:text-slate-400 line-through">{todo.text}</p>
                        <button onClick={() => handleDeleteTodo(todo.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
