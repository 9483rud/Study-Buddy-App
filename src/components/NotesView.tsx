import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Check, X, FileText, Search, Pin, PinOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const STORAGE_KEY = 'studybuddy_notes';

const categories = ['General', 'Ideas', 'Study', 'Work', 'Personal'];

interface NotesViewProps {
  startCreating?: boolean;
}

export function NotesView({ startCreating }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  // Load notes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setNotes(parsed.map((n: Note) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt)
        })));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Open create form when startCreating is true
  useEffect(() => {
    if (startCreating) {
      setIsCreating(true);
    }
  }, [startCreating]);

  const handleCreateNote = () => {
    if (newTitle.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setNotes([newNote, ...notes]);
      resetForm();
    }
  };

  const handleUpdateNote = () => {
    if (editingNote && newTitle.trim()) {
      setNotes(notes.map(n => 
        n.id === editingNote.id 
          ? { ...n, title: newTitle.trim(), content: newContent.trim(), category: newCategory, updatedAt: new Date() }
          : n
      ));
      resetForm();
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNewTitle(note.title);
    setNewContent(note.content);
    setNewCategory(note.category);
    setIsCreating(false);
    setSelectedNote(null);
  };

  const handleTogglePin = (id: string) => {
    setNotes(notes.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    ));
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingNote(null);
    setNewTitle('');
    setNewContent('');
    setNewCategory('General');
  };

  const filteredNotes = notes
    .filter(n => 
      (filterCategory === 'All' || n.category === filterCategory) &&
      (n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       n.content.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Ideas': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'Study': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
      case 'Work': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Personal': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  // Note detail view
  if (selectedNote) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedNote(null)}
            className="mb-4 flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4 rotate-45" />
            <span className="text-sm">Back to notes</span>
          </button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(selectedNote.category)}`}>
                      {selectedNote.category}
                    </span>
                    {selectedNote.pinned && (
                      <Pin className="w-3 h-3 text-amber-500" />
                    )}
                  </div>
                  <CardTitle className="text-xl">{selectedNote.title}</CardTitle>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Last updated: {selectedNote.updatedAt.toLocaleDateString()} at {selectedNote.updatedAt.toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTogglePin(selectedNote.id)}
                    className="h-8 w-8 p-0"
                  >
                    {selectedNote.pinned ? (
                      <PinOff className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Pin className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditNote(selectedNote)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(selectedNote.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{selectedNote.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Notes</h1>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Note
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['All', ...categories].map(cat => (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory(cat)}
                className={filterCategory === cat ? 'bg-violet-500 hover:bg-violet-600' : ''}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingNote) && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Note title..."
              />
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your note here..."
                className="min-h-32"
              />
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Category:</span>
                <div className="flex gap-1 flex-wrap">
                  {categories.map(cat => (
                    <Button
                      key={cat}
                      variant={newCategory === cat ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setNewCategory(cat)}
                      className={newCategory === cat ? 'bg-violet-500 hover:bg-violet-600' : ''}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={editingNote ? handleUpdateNote : handleCreateNote}>
                  {editingNote ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes List */}
        {filteredNotes.length > 0 ? (
          <div className="grid gap-3">
            {filteredNotes.map(note => (
              <Card 
                key={note.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedNote(note)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                          {note.category}
                        </span>
                        {note.pinned && (
                          <Pin className="w-3 h-3 text-amber-500" />
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-white truncate">{note.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{note.content}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        {note.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePin(note.id)}
                        className="h-8 w-8 p-0"
                      >
                        {note.pinned ? (
                          <PinOff className="w-4 h-4 text-amber-500" />
                        ) : (
                          <Pin className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery || filterCategory !== 'All' ? 'No notes found' : 'No notes yet'}
            </p>
            {!searchQuery && filterCategory === 'All' && (
              <Button onClick={() => setIsCreating(true)} variant="outline" className="mt-3">
                Create your first note
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
