import { useState } from 'react';
import { Plus, Trash2, ChevronRight, BookMarked, GraduationCap } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import type { Course, Unit } from './CoursesView';

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
  onSelectUnit: (unit: Unit) => void;
  onUpdateCourse: (course: Course) => void;
  onDeleteUnit: (unitId: string) => void;
}

export function CourseDetailView({ 
  course, 
  onBack, 
  onSelectUnit, 
  onUpdateCourse, 
  onDeleteUnit 
}: CourseDetailViewProps) {
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');

  const handleCreateUnit = () => {
    if (newUnitName.trim()) {
      const newUnit: Unit = {
        id: Date.now().toString(),
        name: newUnitName.trim(),
        description: newUnitDescription.trim(),
        flashcards: [],
        notes: [],
        tasks: [],
      };
      const updatedCourse = { ...course, units: [...course.units, newUnit] };
      onUpdateCourse(updatedCourse);
      setNewUnitName('');
      setNewUnitDescription('');
      setIsCreatingUnit(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className={`p-2 rounded-lg ${course.color}`}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white">{course.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{course.description || 'No description'}</p>
          </div>
        </div>

        {/* Units List */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">Units</h2>
          <Button
            onClick={() => setIsCreatingUnit(true)}
            className="gap-1 bg-violet-500 hover:bg-violet-600 text-white"
          >
            <Plus className="w-4 h-4" />
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
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => { 
                    setIsCreatingUnit(false); 
                    setNewUnitName(''); 
                    setNewUnitDescription(''); 
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Units */}
        {course.units.length > 0 ? (
          <div className="space-y-2">
            {course.units.map(unit => (
              <Card 
                key={unit.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelectUnit(unit)}
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
                        onClick={(e) => { e.stopPropagation(); onDeleteUnit(unit.id); }}
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
            <Button 
              onClick={() => setIsCreatingUnit(true)} 
              className="mt-2 bg-violet-500 hover:bg-violet-600 text-white"
            >
              Add your first unit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
