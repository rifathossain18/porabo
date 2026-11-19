import type { User } from "./types";

type RatingSource = Pick<
  User,
  "rating" | "totalReviews" | "ratingsBreakdown" | "reviews"
>;

export interface TutorRatingSummary {
  average: number;
  reviewCount: number;
  breakdown: {
    punctuality: number;
    subjectMastery: number;
    teachingStyle: number;
  };
}

const validRating = (value: number | undefined): number | null =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 5
    ? value
    : null;

const roundRating = (value: number): number =>
  Math.round(value * 10) / 10;

function average(values: Array<number | null>): number {
  const validValues = values.filter(
    (value): value is number => value !== null,
  );
  if (validValues.length === 0) return 0;
  return roundRating(
    validValues.reduce((sum, value) => sum + value, 0) / validValues.length,
  );
}

export function getTutorRatingSummary(
  tutor: RatingSource | null | undefined,
): TutorRatingSummary {
  const zeroSummary: TutorRatingSummary = {
    average: 0,
    reviewCount: 0,
    breakdown: {
      punctuality: 0,
      subjectMastery: 0,
      teachingStyle: 0,
    },
  };
  if (!tutor) return zeroSummary;

  if (Array.isArray(tutor.reviews)) {
    const approvedReviews = tutor.reviews.filter(
      (review) => (review.status || "APPROVED") === "APPROVED",
    );
    if (approvedReviews.length === 0) return zeroSummary;

    const reviewAverage = (value: number, review: (typeof approvedReviews)[number]) =>
      validRating(value) ??
      average([
        validRating(review.punctuality),
        validRating(review.subjectMastery),
        validRating(review.teachingStyle),
      ]);

    return {
      average: average(
        approvedReviews.map((review) =>
          reviewAverage(review.overall, review),
        ),
      ),
      reviewCount: approvedReviews.length,
      breakdown: {
        punctuality: average(
          approvedReviews.map((review) => validRating(review.punctuality)),
        ),
        subjectMastery: average(
          approvedReviews.map((review) => validRating(review.subjectMastery)),
        ),
        teachingStyle: average(
          approvedReviews.map((review) => validRating(review.teachingStyle)),
        ),
      },
    };
  }

  const reviewCount = Math.max(
    0,
    tutor.totalReviews || 0,
    tutor.ratingsBreakdown?.totalReviews || 0,
  );
  if (reviewCount === 0) return zeroSummary;

  const storedAverage = validRating(tutor.rating) ?? 0;
  return {
    average: roundRating(storedAverage),
    reviewCount,
    breakdown: {
      punctuality:
        roundRating(validRating(tutor.ratingsBreakdown?.punctuality) ?? storedAverage),
      subjectMastery:
        roundRating(validRating(tutor.ratingsBreakdown?.subjectMastery) ?? storedAverage),
      teachingStyle:
        roundRating(validRating(tutor.ratingsBreakdown?.teachingStyle) ?? storedAverage),
    },
  };
}
