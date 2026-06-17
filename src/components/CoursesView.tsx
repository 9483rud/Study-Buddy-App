import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, GraduationCap, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { CourseDetailView } from './CourseDetailView';
import { UnitDetailView } from './UnitDetailView';
import type { View } from '../App';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface Unit {
  id: string;
  name: string;
  description: string;
  flashcards: Flashcard[];
  notes: Note[];
  tasks: Task[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  color: string;
  units: Unit[];
  createdAt: Date;
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

  const updateCourse = (updatedCourse: Course) => {
    setCourses(courses.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    setSelectedCourse(updatedCourse);
  };

  // Unit detail view
  if (selectedUnit) {
    return (
      <UnitDetailView
        course={selectedUnit.course}
        unit={selectedUnit.unit}
        onBack={() => setSelectedUnit(null)}
        onUpdateUnit={(updatedUnit) => {
          const updatedCourse = {
            ...selectedUnit.course,
            units: selectedUnit.course.units.map(u => u.id === updatedUnit.id ? updatedUnit : u)
          };
          updateCourse(updatedCourse);
          setSelectedUnit({ course: updatedCourse, unit: updatedUnit });
        }}
      />
    );
  }

  // Course detail view (showing units)
  if (selectedCourse) {
    return (
      <CourseDetailView
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onSelectUnit={(unit) => setSelectedUnit({ course: selectedCourse, unit })}
        onUpdateCourse={updateCourse}
        onDeleteUnit={(unitId) => {
          const updatedCourse = {
            ...selectedCourse,
            units: selectedCourse.units.filter(u => u.id !== unitId)
          };
          updateCourse(updatedCourse);
        }}
      />
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
            <Button onClick={() => setIsCreating(true)} className="mt-3">
              Create your first course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export { courseColors };
