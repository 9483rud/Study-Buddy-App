import { useState, useEffect, useRef } from "react";
import { Plus, Trash, Edit, ChevronLeft, ChevronRight, X, Check, BookOpen, FolderOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { saveUserData } from "../utils/storage";
import type { Flashcard } from "../types";

interface FlashcardsViewProps {
  userId: string;
  flashcards: Flashcard[];
  setFlashcards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}

export function FlashcardsView({ userId, flashcards, setFlashcards }: FlashcardsViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get unique categories and subcategories
  const categories = [...new Set(flashcards.map((card) => card.category))];
  
  const subcategoriesByCategory = flashcards.reduce((acc, card) => {
    if (card.category && card.subcategory) {
      if (!acc[card.category]) {
        acc[card.category] = new Set();
      }
      acc[card.category].add(card.subcategory);
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  // Filter cards by category and subcategory
  const filteredCards = flashcards.filter((card) => {
    if (selectedCategory && card.category !== selectedCategory) return false;
    if (selectedSubcategory && card.subcategory !== selectedSubcategory) return false;
    return true;
  });

  const studyCards = selectedCategory
    ? flashcards.filter((card) => card.category === selectedCategory)
    : flashcards;

  // Save flashcards whenever they change
  useEffect(() => {
    if (userId) {
      saveUserData(userId, "flashcards", flashcards);
    }
  }, [flashcards, userId]);

  // Handle escape key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isCreating || editingCard)) {
        closeModal();
      }
    };

    if (isCreating || editingCard) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isCreating, editingCard]);

  const openCreateModal = () => {
    setIsCreating(true);
    setQuestion("");
    setAnswer("");
    setCategory("");
    setSubcategory("");
  };

  const openEditModal = (card: Flashcard) => {
    setEditingCard(card);
    setQuestion(card.question);
    setAnswer(card.answer);
    setCategory(card.category);
    setSubcategory(card.subcategory || "");
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingCard(null);
    setQuestion("");
    setAnswer("");
    setCategory("");
    setSubcategory("");
  };

  const handleCreateCard = () => {
    if (!question.trim() || !answer.trim()) return;

    const newCard: Flashcard = {
      id: Date.now().toString(),
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim() || "Uncategorized",
      subcategory: category.trim() ? subcategory.trim() || undefined : undefined,
      createdAt: new Date(),
      timesReviewed: 0,
      difficulty: "medium",
    };

    setFlashcards([...flashcards, newCard]);
    closeModal();
  };

  const handleUpdateCard = () => {
    if (!editingCard || !question.trim() || !answer.trim()) return;

    setFlashcards(
      flashcards.map((card) =>
        card.id === editingCard.id
          ? {
              ...card,
              question: question.trim(),
              answer: answer.trim(),
              category: category.trim() || "Uncategorized",
              subcategory: category.trim() ? subcategory.trim() || undefined : undefined,
            }
          : card
      )
    );

    closeModal();
  };

  const handleDeleteCard = (id: string) => {
    setFlashcards(flashcards.filter((card) => card.id !== id));
  };

  // Clear subcategory when category is cleared
  useEffect(() => {
    if (!category.trim()) {
      setSubcategory("");
    }
  }, [category]);

  const handleStudyNext = () => {
    setCurrentCardIndex((prev) => (prev + 1) % studyCards.length);
    setShowAnswer(false);
    setSwipeOffset(0);
  };

  const handleStudyPrev = () => {
    setCurrentCardIndex((prev) => (prev - 1 + studyCards.length) % studyCards.length);
    setShowAnswer(false);
    setSwipeOffset(0);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      setSwipeOffset(deltaX * 0.3);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    
    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handleStudyPrev();
      } else {
        handleStudyNext();
      }
    }
    
    setSwipeOffset(0);
    setIsSwiping(false);
  };

  // Tap to flip card
  const handleCardTap = () => {
    setShowAnswer(!showAnswer);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Study Mode View
  if (studyMode && studyCards.length > 0) {
    const currentCard = studyCards[currentCardIndex];

    return (
      <div className="p-4 md:p-8 min-h-screen flex flex-col">
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => {
                setStudyMode(false);
                setCurrentCardIndex(0);
                setShowAnswer(false);
              }}
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 min-h-12 px-4"
            >
              <X className="w-5 h-5 mr-2" />
              Exit
            </Button>
            <div className="text-base text-slate-500 dark:text-slate-400 font-medium">
              {currentCardIndex + 1} / {studyCards.length}
            </div>
          </div>

          {selectedCategory && (
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <FolderOpen className="w-4 h-4" />
              <span>{selectedCategory}</span>
              {currentCard.subcategory && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span>{currentCard.subcategory}</span>
                </>
              )}
            </div>
          )}

          {/* Swipeable Card */}
          <div 
            ref={cardRef}
            className="flex-1 flex flex-col justify-center"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Card 
              className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition-transform duration-200 cursor-pointer select-none`}
              style={{ transform: `translateX(${swipeOffset}px) rotate(${swipeOffset * 0.02}deg)` }}
              onClick={handleCardTap}
            >
              <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center min-h-64 md:min-h-80">
                <div className="text-center mb-6">
                  <p className="text-base md:text-lg text-slate-800 dark:text-white whitespace-pre-wrap leading-relaxed">
                    {showAnswer ? currentCard.answer : currentCard.question}
                  </p>
                </div>

                <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
                  {showAnswer ? "Tap to see question" : "Tap to reveal answer"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              onClick={handleStudyPrev}
              variant="outline"
              className="border-slate-300 dark:border-slate-600 min-h-14 min-w-14 md:min-w-32"
            >
              <ChevronLeft className="w-6 h-6 md:mr-2" />
              <span className="hidden md:inline">Previous</span>
            </Button>
            <Button
              onClick={handleStudyNext}
              className="bg-violet-500 hover:bg-violet-600 min-h-14 min-w-14 md:min-w-32"
            >
              <span className="hidden md:inline">Next</span>
              <ChevronRight className="w-6 h-6 md:ml-2" />
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6 flex-wrap pb-4">
            {studyCards.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentCardIndex(index);
                  setShowAnswer(false);
                }}
                className={`w-3 h-3 rounded-full transition-colors touch-manipulation ${
                  index === currentCardIndex
                    ? "bg-violet-500 scale-125"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Flashcards</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {flashcards.length} cards total
            </p>
          </div>
          <div className="flex gap-2">
            {flashcards.length > 0 && (
              <Button
                onClick={() => {
                  setStudyMode(true);
                  setCurrentCardIndex(0);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 min-h-12 px-4"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Study
              </Button>
            )}
            <Button
              onClick={openCreateModal}
              className="bg-violet-500 hover:bg-violet-600 min-h-12 px-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Card
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-6">
            <Label className="text-slate-700 dark:text-slate-300 mb-2 block">Filter by Category</Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-11 ${
                  !selectedCategory
                    ? "bg-violet-500 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-11 ${
                    selectedCategory === cat
                      ? "bg-violet-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subcategory Filter */}
        {selectedCategory && subcategoriesByCategory[selectedCategory] && subcategoriesByCategory[selectedCategory].size > 0 && (
          <div className="mb-6">
            <Label className="text-slate-700 dark:text-slate-300 mb-2 block">Filter by Subcategory</Label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-11 ${
                  !selectedSubcategory
                    ? "bg-violet-500 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
                }`}
              >
                All {selectedCategory}
              </button>
              {Array.from(subcategoriesByCategory[selectedCategory]).map((subcat) => (
                <button
                  key={subcat}
                  onClick={() => setSelectedSubcategory(subcat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation min-h-11 ${
                    selectedSubcategory === subcat
                      ? "bg-violet-500 text-white"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 active:scale-95"
                  }`}
                >
                  {subcat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Flashcards List */}
        {filteredCards.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">
                {selectedCategory || selectedSubcategory
                  ? "No cards match your filter"
                  : "No flashcards yet. Create your first one!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCards.map((card) => (
              <Card
                key={card.id}
                className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="text-xs px-2.5 py-1 bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 rounded-full">
                        {card.category}
                      </span>
                      {card.subcategory && (
                        <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full">
                          {card.subcategory}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(card)}
                        className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 touch-manipulation"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCard(card.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
                      >
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-base font-medium text-slate-800 dark:text-white line-clamp-2">
                      {card.question}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-base text-slate-500 dark:text-slate-400 line-clamp-2">
                      {card.answer}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal Popup */}
      {(isCreating || editingCard) && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={handleBackdropClick}
        >
          <div 
            ref={modalRef}
            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                {editingCard ? "Edit Flashcard" : "Create New Flashcard"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors touch-manipulation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question" className="text-slate-700 dark:text-slate-300 font-medium">
                  Question
                </Label>
                <Textarea
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter your question..."
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white min-h-24 text-base resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="answer" className="text-slate-700 dark:text-slate-300 font-medium">
                  Answer
                </Label>
                <Textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer..."
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white min-h-24 text-base resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-medium">
                  Category
                </Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g., Biology, History..."
                  className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white min-h-12 text-base focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  {categories.map((cat) => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              
              {/* Subcategory only visible when category has text */}
              {category.trim() && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="subcategory" className="text-slate-700 dark:text-slate-300 font-medium">
                    Subcategory
                    <span className="text-slate-400 dark:text-slate-500 text-xs ml-1 font-normal">(optional)</span>
                  </Label>
                  <Input
                    id="subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g., Chapter 1, Cell Division..."
                    className="bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-white min-h-12 text-base focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    list="subcategory-suggestions"
                  />
                  {subcategoriesByCategory[category.trim()] && (
                    <datalist id="subcategory-suggestions">
                      {Array.from(subcategoriesByCategory[category.trim()]).map((subcat) => (
                        <option key={subcat} value={subcat} />
                      ))}
                    </datalist>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
              <Button
                onClick={closeModal}
                variant="outline"
                className="flex-1 border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 min-h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCard ? handleUpdateCard : handleCreateCard}
                disabled={!question.trim() || !answer.trim()}
                className="flex-1 bg-violet-500 hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed min-h-12"
              >
                <Check className="w-5 h-5 mr-2" />
                {editingCard ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}