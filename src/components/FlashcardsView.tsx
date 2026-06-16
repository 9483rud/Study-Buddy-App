import { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCw, ChevronLeft, ChevronRight, Edit, Check, X, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  lastReviewed: Date | null;
  confidence: 'low' | 'medium' | 'high';
}

interface FlashcardsViewProps {
  startCreating?: boolean;
}

export function FlashcardsView({ startCreating = false }: FlashcardsViewProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  useEffect(() => {
    if (startCreating) {
      setIsCreating(true);
    }
  }, [startCreating]);

  const handleCreateCard = () => {
    if (newFront.trim() && newBack.trim()) {
      const newCard: Flashcard = {
        id: Date.now().toString(),
        front: newFront.trim(),
        back: newBack.trim(),
        lastReviewed: null,
        confidence: 'medium',
      };
      setCards([...cards, newCard]);
      setNewFront('');
      setNewBack('');
      setIsCreating(false);
    }
  };

  const handleUpdateCard = () => {
    if (editingCard && newFront.trim() && newBack.trim()) {
      setCards(cards.map(card => 
        card.id === editingCard.id 
          ? { ...card, front: newFront.trim(), back: newBack.trim() }
          : card
      ));
      setEditingCard(null);
      setNewFront('');
      setNewBack('');
    }
  };

  const handleDeleteCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id));
    if (currentCardIndex >= cards.length - 1) {
      setCurrentCardIndex(Math.max(0, cards.length - 2));
    }
  };

  const handleEditCard = (card: Flashcard) => {
    setEditingCard(card);
    setNewFront(card.front);
    setNewBack(card.back);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setNewFront('');
    setNewBack('');
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentCardIndex];

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">Flashcards</h1>
          <Button onClick={() => { setIsCreating(true); setEditingCard(null); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Card
          </Button>
        </div>

        {/* Create/Edit Card Form */}
        {(isCreating || editingCard) && (
          <Card className="mb-4 border-violet-200 dark:border-violet-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Front (Question)</label>
                <Textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Enter the question..."
                  className="min-h-16 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">Back (Answer)</label>
                <Textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Enter the answer..."
                  className="min-h-16 text-sm"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={editingCard ? handleCancelEdit : () => setIsCreating(false)}
                  className="gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
                <Button onClick={editingCard ? handleUpdateCard : handleCreateCard} className="gap-1">
                  <Check className="w-4 h-4" />
                  {editingCard ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {cards.length === 0 && !isCreating ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 mb-3">No flashcards yet</p>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Card
            </Button>
          </div>
        ) : cards.length > 0 ? (
          <>
            {/* Flashcard Display */}
            <div className="relative mb-4">
              <Card 
                className={`cursor-pointer transition-all duration-300 min-h-48 ${isFlipped ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-white dark:bg-slate-800'}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <CardContent className="flex items-center justify-center min-h-48 p-6">
                  <p className="text-center text-base font-medium text-slate-800 dark:text-white">
                    {isFlipped ? currentCard?.back : currentCard?.front}
                  </p>
                </CardContent>
              </Card>
              <div className="absolute top-2 right-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleEditCard(currentCard); }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleDeleteCard(currentCard.id); }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={prevCard} className="gap-1">
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {currentCardIndex + 1} / {cards.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFlipped(false)}
                  className="gap-1"
                >
                  <RotateCw className="w-4 h-4" />
                  Flip
                </Button>
              </div>
              <Button variant="outline" onClick={nextCard} className="gap-1">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : null}

        {/* Card List */}
        {cards.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">All Cards</h2>
            <div className="space-y-2">
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-violet-300 dark:hover:border-violet-600 transition-colors ${index === currentCardIndex ? 'border-violet-500 dark:border-violet-500' : ''}`}
                  onClick={() => { setCurrentCardIndex(index); setIsFlipped(false); }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{card.front}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{card.back}</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleEditCard(card); }}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteCard(card.id); }}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
