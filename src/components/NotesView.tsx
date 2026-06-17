import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit, X, FileText, Upload, File, ExternalLink, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  fileType?: 'pdf' | 'word' | 'markdown' | 'txt' | null;
  originalFileName?: string;
  originalFileContent?: string;
}

const STORAGE_KEY = 'studybuddy_notes';

interface NotesViewProps {
  startCreating?: boolean;
}

export function NotesView({ startCreating }: NotesViewProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'extracted' | 'original'>('extracted');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getFileType = (file: File): 'pdf' | 'word' | 'markdown' | 'txt' | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
    if (extension === 'docx' || extension === 'doc' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || mimeType === 'application/msword') return 'word';
    if (extension === 'md' || extension === 'markdown') return 'markdown';
    if (extension === 'txt' || mimeType === 'text/plain') return 'txt';
    return null;
  };

  const extractTextFromFile = async (file: File): Promise<{ text: string; fileType: 'pdf' | 'word' | 'markdown' | 'txt' | null }> => {
    const fileType = getFileType(file);
    
    if (fileType === 'txt' || fileType === 'markdown') {
      const text = await file.text();
      return { text, fileType };
    }
    
    if (fileType === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let text = '';
      
      // Basic PDF text extraction
      for (let i = 0; i < uint8Array.length; i++) {
        const char = uint8Array[i];
        if (char >= 32 && char <= 126) {
          text += String.fromCharCode(char);
        } else if (char === 10 || char === 13) {
          text += '\n';
        }
      }
      
      text = text
        .replace(/[^\x20-\x7E\n]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      return { text: `[PDF Content extracted from: ${file.name}]\n\n${text}`, fileType };
    }
    
    if (fileType === 'word') {
      // For Word docs, extract what we can from the binary
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let text = '';
      
      // Extract readable text from Word document binary
      for (let i = 0; i < uint8Array.length; i++) {
        const char = uint8Array[i];
        if (char >= 32 && char <= 126) {
          text += String.fromCharCode(char);
        } else if (char === 10 || char === 13) {
          text += '\n';
        }
      }
      
      // Clean up extracted text
      text = text
        .replace(/[^\x20-\x7E\n]/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      return { text: `[Word Document: ${file.name}]\n\n${text}`, fileType };
    }
    
    return { text: '', fileType: null };
  };

  const generateTitle = (content: string, fileName?: string): string => {
    if (fileName) {
      const name = fileName.replace(/\.[^/.]+$/, '');
      return name.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
    
    const firstLine = content.split('\n')[0].trim();
    if (firstLine && firstLine.length < 50) {
      return firstLine;
    }
    
    const words = content.split(/\s+/).slice(0, 5).join(' ');
    if (words.length > 0) {
      return words.length > 40 ? words.substring(0, 40) + '...' : words;
    }
    
    return 'Untitled Note';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setUploadedFile(file);
    
    try {
      const { text, fileType } = await extractTextFromFile(file);
      setNewContent(text);
      const generatedTitle = generateTitle(text, file.name);
      setNewTitle(generatedTitle);
    } catch (error) {
      console.error('Error processing file:', error);
      setNewTitle(generateTitle('', file.name));
      setNewContent(`[Error processing file: ${file.name}]`);
    }
    
    setIsProcessing(false);
  };

  const handleCreateNote = async () => {
    if (newTitle.trim() || newContent.trim()) {
      const fileType = uploadedFile ? getFileType(uploadedFile) : null;
      
      let originalFileContent: string | undefined;
      
      if (uploadedFile) {
        originalFileContent = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(uploadedFile);
        });
      }
      
      const newNote: Note = {
        id: Date.now().toString(),
        title: newTitle.trim() || generateTitle(newContent),
        content: newContent.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
        fileType: fileType,
        originalFileName: uploadedFile?.name,
        originalFileContent: originalFileContent,
      };
      setNotes([newNote, ...notes]);
      resetForm();
    }
  };

  const handleUpdateNote = () => {
    if (editingNote && (newTitle.trim() || newContent.trim())) {
      setNotes(notes.map(n => 
        n.id === editingNote.id 
          ? { 
              ...n, 
              title: newTitle.trim() || generateTitle(newContent),
              content: newContent.trim(), 
              updatedAt: new Date(),
              originalFileName: uploadedFile?.name || n.originalFileName,
              originalFileContent: uploadedFile ? n.originalFileContent : n.originalFileContent,
              fileType: uploadedFile ? getFileType(uploadedFile) : n.fileType,
            }
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
    setIsCreating(false);
    setSelectedNote(null);
  };

  const resetForm = () => {
    setIsCreating(false);
    setEditingNote(null);
    setNewTitle('');
    setNewContent('');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileTypeIcon = (fileType?: string) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'word': return '📝';
      case 'markdown': return '📑';
      case 'txt': return '📃';
      default: return '📝';
    }
  };

  const getFileTypeLabel = (fileType?: string) => {
    switch (fileType) {
      case 'pdf': return 'PDF';
      case 'word': return 'Word';
      case 'markdown': return 'Markdown';
      case 'txt': return 'Text';
      default: return 'Note';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Note detail view
  if (selectedNote) {
    return (
      <div className="p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => { setSelectedNote(null); setViewMode('extracted'); }}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getFileTypeIcon(selectedNote.fileType)}</span>
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">{selectedNote.title}</h1>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {getFileTypeLabel(selectedNote.fileType)} • Last updated {formatDate(selectedNote.updatedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditNote(selectedNote)}
                className="gap-1"
              >
                <Edit className="w-3 h-3" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteNote(selectedNote.id)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* View Toggle for uploaded files */}
          {selectedNote.fileType && (
            <div className="flex gap-2 mb-4">
              <Button
                variant={viewMode === 'extracted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('extracted')}
                className={viewMode === 'extracted' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-500'}
              >
                <File className="w-4 h-4 mr-1" />
                Extracted Text
              </Button>
              <Button
                variant={viewMode === 'original' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('original')}
                className={viewMode === 'original' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-500'}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Original File
              </Button>
            </div>
          )}

          {/* Content */}
          <Card>
            <CardContent className="p-6">
              {viewMode === 'original' && selectedNote.originalFileContent ? (
                <div className="space-y-4">
                  {selectedNote.fileType === 'pdf' && (
                    <div className="bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                      <iframe
                        src={selectedNote.originalFileContent}
                        className="w-full h-96 rounded-lg"
                        title="PDF Preview"
                      />
                    </div>
                  )}
                  {(selectedNote.fileType === 'txt' || selectedNote.fileType === 'markdown') && (
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                      {selectedNote.content}
                    </div>
                  )}
                  {selectedNote.fileType === 'word' && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 min-h-64">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {selectedNote.content.replace(/\[Word Document:.*?\]\n\n/, '')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {selectedNote.originalFileContent && (
                      <a
                        href={selectedNote.originalFileContent}
                        download={selectedNote.originalFileName}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Download File
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {selectedNote.content || 'No content'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main notes list view
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

        {/* Create/Edit Form */}
        {(isCreating || editingNote) && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {editingNote ? 'Edit Note' : 'Create New Note'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm text-slate-500 dark:text-slate-400">Upload a file (optional)</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.md,.markdown,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    {uploadedFile ? uploadedFile.name : 'Choose File'}
                  </label>
                  {uploadedFile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setUploadedFile(null); setNewTitle(''); setNewContent(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Supported: PDF, Word (.doc, .docx), Markdown, Text files
                </p>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-sm text-slate-500 dark:text-slate-400">Title</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={isProcessing ? 'Generating title...' : 'Note title (auto-generated from file)'}
                  disabled={isProcessing}
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-sm text-slate-500 dark:text-slate-400">Content</label>
                <Textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Write your note here... (or upload a file to extract text)"
                  className="min-h-32"
                  disabled={isProcessing}
                />
                {isProcessing && (
                  <p className="text-xs text-blue-500 flex items-center gap-1">
                    <span className="animate-spin">⏳</span> Processing file...
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={editingNote ? handleUpdateNote : handleCreateNote} disabled={isProcessing}>
                  {editingNote ? 'Update' : 'Create'}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        {notes.length > 0 && (
          <div className="mb-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="text-sm"
            />
          </div>
        )}

        {/* Notes List */}
        {filteredNotes.length > 0 ? (
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <Card 
                key={note.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedNote(note)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="text-xl mt-0.5">{getFileTypeIcon(note.fileType)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-800 dark:text-white truncate">{note.title}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {getFileTypeLabel(note.fileType)} • {formatDate(note.updatedAt)}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {note.content.substring(0, 150)}{note.content.length > 150 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
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
        ) : notes.length === 0 && !isCreating ? (
          /* Get Started Empty State */
          <Card className="border-2 border-dashed border-slate-200 dark:border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Get Started with Notes</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                Upload your study materials or create notes from scratch. We support PDF, Word, Markdown, and text files.
              </p>
              <Button onClick={() => setIsCreating(true)} className="gap-2 bg-amber-500 hover:bg-amber-600">
                <Plus className="w-4 h-4" />
                Create Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : searchQuery && filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No notes found matching your search</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
