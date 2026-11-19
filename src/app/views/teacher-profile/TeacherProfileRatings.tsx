import { Award, Info } from "lucide-react";
import { CATEGORY_TOOLTIPS } from "../../../components/TutorDetailModal";
import { getTutorRatingSummary } from "../../../lib/ratings";
import type { User } from "../../../lib/types";
import { useAppContext } from "../../AppContext";

interface TeacherProfileRatingsProps {
  tutor: User;
}

const RATING_CATEGORIES = [
  { key: "punctuality", label: "Punctuality" },
  { key: "subjectMastery", label: "Subject mastery" },
  { key: "teachingStyle", label: "Teaching style" },
] as const;

export function TeacherProfileRatings({ tutor }: TeacherProfileRatingsProps) {
  const { profileActiveTooltip, setProfileActiveTooltip } = useAppContext();
  const ratingSummary = getTutorRatingSummary(tutor);
  const hasTutorReviews = ratingSummary.reviewCount > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <Award className="h-4 w-4" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900">Teaching ratings</h2>
            <p className="text-xs text-slate-500">
              {hasTutorReviews
                ? `${ratingSummary.reviewCount} approved reviews`
                : "Ratings appear after approved reviews"}
            </p>
          </div>
        </div>
        <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-800">
          {hasTutorReviews ? ratingSummary.average.toFixed(1) : "—"}
          <span className="ml-1 text-xs font-medium text-amber-700">/ 5</span>
        </span>
      </div>

      <div className="mt-5 space-y-4">
        {RATING_CATEGORIES.map((category) => {
          const score = ratingSummary.breakdown[category.key];
          const isOpen = profileActiveTooltip === category.key;
          const tooltip = CATEGORY_TOOLTIPS[category.key];

          return (
            <div key={category.key}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() =>
                  setProfileActiveTooltip(isOpen ? null : category.key)
                }
                className="flex w-full items-center justify-between gap-3 text-left"
              >
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                  {category.label}
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  {hasTutorReviews ? score.toFixed(1) : "—"}
                  <span className="ml-1 text-xs font-normal text-slate-500">/ 5</span>
                </span>
              </button>

              <div
                className="mt-2 grid grid-cols-5 gap-1"
                role="meter"
                aria-label={`${category.label} rating`}
                aria-valuemin={0}
                aria-valuemax={5}
                aria-valuenow={hasTutorReviews ? score : 0}
              >
                {RATING_CATEGORIES.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full ${
                      hasTutorReviews && score >= index + 1
                        ? "bg-blue-600"
                        : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>

              {isOpen && (
                <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                  <span className="font-semibold text-slate-800">{tooltip.title}. </span>
                  {tooltip.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
