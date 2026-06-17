import { useState } from 'react';
import { Plus, Trash2, ChevronRight, BookOpen, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import type { Course, Unit, Flashcard, Note, Task } from './CoursesView';

interface UnitDetailViewProps {
  course: Course;
  unit: Unit;
  onBack: () => void;
  onUpdateUnit: (unit: Unit) => void;
}

export function UnitDetailView({ course, unit, onBack, onUpdateUnit }: UnitDetailViewProps) {
  // Flashcard state
  const [isCreatingFlashcard, setIsCreatingFlashcard] = useState(false);
  const [newFlashcardFront, setNewFlashcardFront] = useState('');
  const [newFlashcardBack, setNewFlashcardBack] = useState('');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Note state
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Task state
  const [newTaskText, setNewTaskText] = useState('');

  // Flashcard functions
  const handleCreateFlashcard = () => {
    if (newFlashcardFront.trim() && newFlashcardBack.trim()) {
      const newFlashcard: Flashcard = {
        id: Date.now().toString(),
        front: newFlashcardFront.trim(),
        back: newFlashcardBack.trim(),
      };
      onUpdateUnit({ ...unit, flashcards: [...unit.flashcards, newFlashcard] });
      setNewFlashcardFront('');
      setNewFlashcardBack('');
      setIsCreatingFlashcard(false);
    }
  };

  const handleDeleteFlashcard = (flashcardId: string) => {
    const updatedFlashcards = unit.flashcards.filter(f => f.id !== flashcardId);
    onUpdateUnit({ ...unit, flashcards: updatedFlashcards });
    if (currentFlashcardIndex >= updatedFlashcards.length) {
      setCurrentFlashcardIndex(Math.max(0, updatedFlashcards.length - 1));
    }
  };

  // Note functions
  const handleCreateNote = () => {
    if (newNoteTitle.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
      };
      onUpdateUnit({ ...unit, notes: [...unit.notes, newNote] });
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsCreatingNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    onUpdateUnit({ ...unit, notes: unit.notes.filter(n => n.id !== noteId) });
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
    }
  };

  // Task functions
  const handleCreateTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
      };
      onUpdateUnit({ ...unit, tasks: [...unit.tasks, newTask] });
      setNewTaskText('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    onUpdateUnit({
      ...unit,
      tasks: unit.tasks.map(t => 
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    });
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateUnit({ ...unit, tasks: unit.tasks.filter(t => t.id !== taskId) });
  };

  const currentFlashcard = unit.flashcards[currentFlashcardIndex];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className={`p-2 rounded-lg ${course.color}`}>
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">{unit.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{course.name}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Flashcards Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-500" />
                  Flashcards ({unit.flashcards.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingFlashcard(true)}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isCreatingFlashcard ? (
                <div className="space-y-2">
                  <Input
                    value={newFlashcardFront}
                    onChange={(e) => setNewFlashcardFront(e.target.value)}
                    placeholder="Front (question)"
                    className="text-sm"
                  />
                  <Input
                    value={newFlashcardBack}
                    onChange={(e) => setNewFlashcardBack(e.target.value)}
                    placeholder="Back (answer)"
                    className="text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateFlashcard}>Create</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreatingFlashcard(false)}>Cancel</Button>
                  </div>
                </div>
              ) : unit.flashcards.length > 0 ? (
                <div>
                  <div
                    className={`min-h-24 flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${isFlipped ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-300 dark:border-violet-700' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600'}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <p className="text-sm text-center text-slate-800 dark:text-white">
                      {isFlipped ? currentFlashcard?.back : currentFlashcard?.front}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1)); }}
                      disabled={currentFlashcardIndex === 0}
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-slate-500">
                      {currentFlashcardIndex + 1} / {unit.flashcards.length}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsFlipped(false); setCurrentFlashcardIndex(Math.min(unit.flashcards.length - 1, currentFlashcardIndex + 1)); }}
                      disabled={currentFlashcardIndex === unit.flashcards.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFlashcard(currentFlashcard.id)}
                      className="text-red-500 hover:text-red-600 h-7"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No flashcards yet</p>
              )}
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Notes ({unit.notes.length})
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreatingNote(true)}
                  className="h-7 w-7 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isCreatingNote ? (
                <div className="space-y-2">
                  <Input
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Note title"
                    className="text-sm"
                  />
                  <Textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Note content..."
                    className="text-sm min-h-16"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCreateNote}>Create</Button>
                    <Button size="sm" variant="outline" onClick={() => setIsCreatingNote(false)}>Cancel</Button>
                  </div>
                </div>
              ) : selectedNote ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{selectedNote.title}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedNote(null)}
                      className="h-6 text-xs"
                    >
                      Back
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{selectedNote.content}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="text-red-500 hover:text-red-600 h-7 mt-2"
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
                </div>
              ) : unit.notes.length > 0 ? (
                <div className="space-y-2">
                  {unit.notes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      className="w-full p-2 text-left bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                    >
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{note.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{note.content}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No notes yet</p>
              )}
            </CardContent>
          </Card>

          {/* Tasks Section */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Tasks ({unit.tasks.filter(t => t.completed).length}/{unit.tasks.length} completed)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  placeholder="Add a task..."
                  className="text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTask()}
                />
                <Button size="sm" onClick={handleCreateTask}>Add</Button>
              </div>
              {unit.tasks.length > 0 ? (
                <div className="space-y-1">
                  {unit.tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-500'}`}
                      >
                        {task.completed && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`text-sm flex-1 ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {task.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No tasks yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
