import { useState } from "react";
import { Plus, Search, Trash2, Edit, X, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import type { Note } from "../App";

interface NotesViewProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

export function NotesView({ notes, setNotes }: NotesViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [newNote, setNewNote] = useState({ title: "", content: "", category: "General" });

  const categories = ["General", "Math", "Science", "History", "Language", "Programming"];

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || note.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreate = () => {
    if (!newNote.title || !newNote.content) return;

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setNotes([note, ...notes]);
    setNewNote({ title: "", content: "", category: "General" });
    setIsCreating(false);
  };

  const handleUpdate = (id: string) => {
    setNotes(
      notes.map((n) =>
        n.id === id
          ? { ...n, title: newNote.title, content: newNote.content, category: newNote.category, updatedAt: new Date() }
          : n
      )
    );
    setEditingId(null);
    setNewNote({ title: "", content: "", category: "General" });
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setNewNote({ title: note.title, content: note.content, category: note.category });
    setIsCreating(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Notes</h1>
          <p className="text-slate-500 mt-1">{notes.length} notes</p>
        </div>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
          }}
          className="gap-2 bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="w-4 h-4" />
          New Note
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingId ? "Edit Note" : "Create Note"}</CardTitle>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={newNote.category}
                  onChange={(e) => setNewNote({ ...newNote, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note..."
                  rows={8}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => (editingId ? handleUpdate(editingId) : handleCreate())}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                >
                  {editingId ? "Save Changes" : "Create Note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-slate-500 mb-4">
              {notes.length === 0 ? "No notes yet" : "No matching notes"}
            </p>
            {notes.length === 0 && (
              <Button onClick={() => setIsCreating(true)} className="bg-emerald-500 hover:bg-emerald-600">
                Create your first note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{note.title}</CardTitle>
                    <span className="text-xs text-slate-400">{note.category}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-1 text-slate-400 hover:text-emerald-500"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm line-clamp-4">{note.content}</p>
                <p className="text-xs text-slate-400 mt-3">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}