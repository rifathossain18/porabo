import { TutorOverviewSection } from "./TutorOverviewSection";
import { TutorAnalyticsSection } from "./TutorAnalyticsSection";
import { TutorFeedSection } from "./TutorFeedSection";

export function TutorDashboardContent() {
  return (
    <div className="space-y-6">
      <TutorOverviewSection />
      <TutorAnalyticsSection />
      <TutorFeedSection />
    </div>
  );
}
