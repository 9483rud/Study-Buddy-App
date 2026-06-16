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

export function calculateNextReview(currentData: SRSData, grade: Grade): SRSResult {
  let { easeFactor, intervalDays, repetitions } = currentData;

  if (grade >= 3) {
    if (repetitions === 0) {
      intervalDays = 1;
    } else if (repetitions === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    intervalDays = 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, nextReviewDate, lastReviewGrade: grade };
}

export function getGradeDescription(grade: Grade): string {
  const descriptions = ['Forgot', 'Barely', 'Hard', 'Good', 'Easy', 'Perfect'];
  return descriptions[grade];
}

export function getGradeColor(grade: Grade): string {
  const colors = [
    'bg-red-500 hover:bg-red-600',
    'bg-orange-500 hover:bg-orange-600',
    'bg-amber-500 hover:bg-amber-600',
    'bg-yellow-500 hover:bg-yellow-600',
    'bg-lime-500 hover:bg-lime-600',
    'bg-emerald-500 hover:bg-emerald-600',
  ];
  return colors[grade];
}

export function getDaysUntilNextReview(nextReviewDate: string | Date): number {
  const reviewDate = typeof nextReviewDate === 'string' ? new Date(nextReviewDate) : nextReviewDate;
  const now = new Date();
  const diffTime = reviewDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isCardDue(nextReviewDate: string | Date): boolean {
  const reviewDate = typeof nextReviewDate === 'string' ? new Date(nextReviewDate) : nextReviewDate;
  return reviewDate <= new Date();
}
