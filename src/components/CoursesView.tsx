import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, X, BookOpen, Clock, FileText, GraduationCap, ChevronRight, BookMarked } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import type { View } from '../App';

interface Unit {
  id: string;
  name: string;
  description: string;
  flashcards: Flashcard[];
  notes: Note[];
  tasks: Task[];
}

interface Course {
  id: string;
  name: string;
  description: string;
  color: string;
  units: Unit[];
  createdAt: Date;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const STORAGE_KEY = 'studybuddy_courses';

const courseColors = [
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-pink-500',
];

interface CoursesViewProps {
  onNavigate: (view: View) => void;
  startCreating?: boolean;
}

export function CoursesView({ onNavigate, startCreating }: CoursesViewProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<{ course: Course; unit: Unit } | null>(null);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState(courseColors[0]);

  // Unit creation state
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');

  // Flashcard state within unit
  const [isCreatingFlashcard, setIsCreatingFlashcard] = useState(false);
  const [newFlashcardFront, setNewFlashcardFront] = useState('');
  const [newFlashcardBack, setNewFlashcardBack] = useState('');
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Note state within unit
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // Task state within unit
  const [newTaskText, setNewTaskText] = useState('');

  // Load courses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCourses(parsed.map((c: Course) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        })));
      } catch (e) {
        console.error('Failed to load courses:', e);
      }
    }
  }, []);

  // Save courses to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  // Open create form when startCreating is true
  useEffect(() => {
    if (startCreating) {
      setIsCreating(true);
    }
  }, [startCreating]);

  const handleCreateCourse = () => {
    if (newName.trim()) {
      const newCourse: Course = {
        id: Date.now().toString(),
        name: newName.trim(),
        description: newDescription.trim(),
        color: newColor,
        units: [],
        createdAt: new Date(),
      };
      setCourses([...courses, newCourse]);
      resetForm();
    }
  };

  const handleUpdateCourse = () => {
    if (editingCourse && newName.trim()) {
      setCourses(courses.map(c => 
        c.id === editingCourse.id 
          ? { ...c, name: newName.trim(), description: newDescription.trim(), color: newColor }
          : c
      ));
      resetForm();
    }
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
    if (selectedCourse?.id === id) {
      setSelectedCourse(null);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewName(course.name);
    setNewDescription(course.description);
    setNewColor(course.color);
    setIsCreating(false);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingCourse(null);
    setNewName('');
    setNewDescription('');
    setNewColor(courseColors[0]);
  };

  // Unit functions
  const handleCreateUnit = () => {
    if (selectedCourse && newUnitName.trim()) {
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: newUnitName.trim(),
        description: newUnitDescription.trim(),
        flashcards: [],
        notes: [],
        tasks: [],
      };
      const updatedCourses = courses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, units: [...c.units, newUnit] }
          : c
      );
      setCourses(updatedCourses);
      setSelectedCourse({ ...selectedCourse, units: [...selectedCourse.units, newUnit] });
      setNewUnitName('');
      setNewUnitDescription('');
      setIsCreatingUnit(false);
    }
  };

  const handleDeleteUnit = (courseId: string, unitId: string) => {
    const updatedCourses = courses.map(c => 
      c.id === courseId 
        ? { ...c, units: c.units.filter(u => u.id !== unitId) }
        : c
    );
    setCourses(updatedCourses);
    if (selectedCourse) {
      setSelectedCourse({ ...selectedCourse, units: selectedCourse.units.filter(u => u.id !== unitId) });
    }
    if (selectedUnit?.unit.id === unitId) {
      setSelectedUnit(null);
    }
  };

  // Flashcard functions within unit
  const handleCreateFlashcard = () => {
    if (selectedUnit && newFlashcardFront.trim() && newFlashcardBack.trim()) {
      const newFlashcard: Flashcard = {
        id: Date.now().toString(),
        front: newFlashcardFront.trim(),
        back: newFlashcardBack.trim(),
      };
      const updatedUnit = { 
        ...selectedUnit.unit, 
        flashcards: [...selectedUnit.unit.flashcards, newFlashcard] 
      };
      const updatedCourses = courses.map(c => ({
        ...c,
        units: c.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
      }));
      setCourses(updatedCourses);
      setSelectedUnit({ ...selectedUnit, unit: updatedUnit });
      setNewFlashcardFront('');
      setNewFlashcardBack('');
      setIsCreatingFlashcard(false);
    }
  };

  const handleDeleteFlashcard = (flashcardId: string) => {
    if (selectedUnit) {
      const updatedUnit = {
        ...selectedUnit.unit,
        flashcards: selectedUnit.unit.flashcards.filter(f => f.id !== flashcardId)
      };
      const updatedCourses = courses.map(c => ({
        ...c,
        units: c.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
      }));
      setCourses(updatedCourses);
      setSelectedUnit({ ...selectedUnit, unit: updatedUnit });
      if (currentFlashcardIndex >= updatedUnit.flashcards.length) {
        setCurrentFlashcardIndex(Math.max(0, updatedUnit.flashcards.length - 1));
      }
    }
  };

  // Note functions within unit
  const handleCreateNote = () => {
    if (selectedUnit && newNoteTitle.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
      };
      const updatedUnit = {
        ...selectedUnit.unit,
        notes: [...selectedUnit.unit.notes, newNote]
      };
      const updatedCourses = courses.map(c => ({
        ...c,
        units: c.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
      }));
      setCourses(updatedCourses);
      setSelectedUnit({ ...selectedUnit, unit: updatedUnit });
      setNewNoteTitle('');
      setNewNoteContent('');
      setIsCreatingNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (selectedUnit) {
      const updatedUnit = {
        ...selectedUnit.unit,
        notes: selectedUnit.unit.notes.filter(n => n.id !== noteId)
      };
      const updatedCourses = courses.map(c => ({
        ...c,
        units: c.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
      }));
      setCourses(updatedCourses);
      setSelectedUnit({ ...selectedUnit, unit: updatedUnit });
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    }
  };

  // Task functions within unit
  const handleCreateTask = () => {
    if (selectedUnit && newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
      };
      const updatedUnit = {
        ...selectedUnit.unit,
        tasks: [...selectedUnit.unit.tasks, newTask]
      };
      const updatedCourses = courses.map(c => ({
        ...c,
        units: c.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
      }));
      setCourses(updatedCourses);
      setSelectedUnit({ ...selectedUnit, unit: updatedUnit });
      setNewTaskText('');
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (selectedUnit) {
      const updatedUnit = {
        ...selectedUnit.unit,
        tasks: selectedUnit.unit.tasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      };
      const updatedCourses = courses.map(c => ({
        ...c,
        units: c.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
      }));
      setCourses(updatedCourses);
      setSelectedUnit({ ...selectedUnit, unit: updatedUnit });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (selectedUnit) {
      const updatedUnit = {
        ...selectedUnit.unit,
        tasks: selectedUnit.unit.tasks.filter(t => t.id !== taskId)
      };
      const updatedCourses = courses.map(c => ({
        ...c,
        units: c.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
      }));
      setCourses(updatedCourses);
      setSelectedUnit({ ...selectedUnit, unit: updatedUnit });
    }
  };

  // Unit detail view
  if (selectedUnit) {
    const unit = selectedUnit.unit;
    const course = selectedUnit.course;
    const currentFlashcard = unit.flashcards[currentFlashcardIndex];

    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedUnit(null)}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className={`p-2 rounded-lg ${course.color}`}>
              <GraduationCap className="w-4 h-4 text-white" />
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

  // Course detail view (showing units)
  if (selectedCourse) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedCourse(null)}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <div className={`p-2 rounded-lg ${selectedCourse.color}`}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white">{selectedCourse.name}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCourse.description || 'No description'}</p>
            </div>
          </div>

          {/* Units List */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Units</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingUnit(true)}
              className="gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Unit
            </Button>
          </div>

          {/* Create Unit Form */}
          {isCreatingUnit && (
            <Card className="mb-3">
              <CardContent className="pt-4 space-y-2">
                <Input
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Unit name"
                  className="text-sm"
                />
                <Input
                  value={newUnitDescription}
                  onChange={(e) => setNewUnitDescription(e.target.value)}
                  placeholder="Description (optional)"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreateUnit}>Create Unit</Button>
                  <Button size="sm" variant="outline" onClick={() => { setIsCreatingUnit(false); setNewUnitName(''); setNewUnitDescription(''); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Units */}
          {selectedCourse.units.length > 0 ? (
            <div className="space-y-2">
              {selectedCourse.units.map(unit => (
                <Card 
                  key={unit.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedUnit({ course: selectedCourse, unit })}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookMarked className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">{unit.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {unit.flashcards.length} flashcards • {unit.notes.length} notes • {unit.tasks.length} tasks
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleDeleteUnit(selectedCourse.id, unit.id); }}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookMarked className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No units yet</p>
              <Button variant="outline" size="sm" onClick={() => setIsCreatingUnit(true)} className="mt-2">
                Add your first unit
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main courses list view
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Courses</h1>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Course
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingCourse) && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Course name"
              />
              <Textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                className="min-h-16"
              />
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {courseColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`w-8 h-8 rounded-full ${color} ${newColor === color ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}>
                  {editingCourse ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses List */}
        {courses.length > 0 ? (
          <div className="space-y-2">
            {courses.map(course => (
              <Card 
                key={course.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedCourse(course)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${course.color}`}>
                        <GraduationCap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">{course.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {course.units.length} units • {course.units.reduce((acc, u) => acc + u.flashcards.length, 0)} flashcards
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCourse(course)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GraduationCap className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No courses yet</p>
            <Button onClick={() => setIsCreating(true)} variant="outline" className="mt-3">
              Create your first course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
