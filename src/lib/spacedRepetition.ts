// SM-2 Algorithm implementation for spaced repetition

export type Grade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSData {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: Date;
}

export interface SRSResult extends SRSData {
  lastReviewGrade: Grade;
}

// Grade meanings:
// 0 - Complete blackout (forgot everything)
// 1 - Incorrect but recognized the answer
// 2 - Incorrect, but the answer was easy to recall
// 3 - Correct but with significant difficulty
// 4 - Correct with some hesitation
// 5 - Perfect response

export function calculateNextReview(
  currentData: SRSData,
  grade: Grade
): SRSResult {
  let { easeFactor, intervalDays, repetitions } = currentData;

  if (grade >= 3) {
    // Correct response
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response - reset
    repetitions = 0;
    intervalDays = 1;
  }

  // Update ease factor using SM-2 formula
  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  easeFactor = Math.max(1.3, easeFactor); // Minimum ease factor

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return {
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewDate,
    lastReviewGrade: grade,
  };
}

export function getGradeDescription(grade: Grade): string {
  switch (grade) {
    case 0: return 'Forgot completely';
    case 1: return 'Wrong, but recognized';
    case 2: return 'Wrong, but familiar';
    case 3: return 'Correct, but difficult';
    case 4: return 'Correct, some hesitation';
    case 5: return 'Perfect recall';
  }
}

export function getGradeColor(grade: Grade): string {
  switch (grade) {
    case 0: return 'bg-red-500 hover:bg-red-600';
    case 1: return 'bg-orange-500 hover:bg-orange-600';
    case 2: return 'bg-amber-500 hover:bg-amber-600';
    case 3: return 'bg-yellow-500 hover:bg-yellow-600';
    case 4: return 'bg-lime-500 hover:bg-lime-600';
    case 5: return 'bg-emerald-500 hover:bg-emerald-600';
  }
}

export function getDaysUntilNextReview(nextReviewDate: Date): number {
  const now = new Date();
  const diffTime = nextReviewDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isCardDue(nextReviewDate: Date): boolean {
  return nextReviewDate <= new Date();
}
