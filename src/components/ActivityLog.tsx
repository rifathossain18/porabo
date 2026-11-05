import React from 'react';
import {
  Clock,
  BookOpen,
  Users,
  CheckCircle2,
  Calendar,
  DollarSign,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { TuitionPost, TuitionApplication } from '../lib/types';

interface ActivityLogProps {
  posts: TuitionPost[];
  applications: TuitionApplication[];
  onViewPost?: (postId: string) => void;
}

interface TimelineItem {
  id: string;
  type: 'POST_CREATED' | 'APPLICATION_RECEIVED' | 'MATCH_ACCEPTED';
  title: string;
  description: string;
  timestamp: string;
  meta?: string;
  statusBadge?: string;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  posts,
  applications,
  onViewPost
}) => {
  // Aggregate and sort all student events chronologically
  const timelineEvents: TimelineItem[] = React.useMemo(() => {
    const list: TimelineItem[] = [];

    // 1. Post creation events
    posts.forEach(p => {
      list.push({
        id: `event_post_${p.id}`,
        type: 'POST_CREATED',
        title: `Tuition Requirement Posted: "${p.title}"`,
        description: `${p.subject} • ${p.gradeLevel} • ৳ ${p.salaryBudget.toLocaleString()}/mo • ${p.areaName}, ${p.district}`,
        timestamp: p.createdAt || new Date().toISOString(),
        statusBadge: p.approvalStatus === 'PENDING' ? 'Under Review' : p.status === 'MATCHED' ? 'Matched' : 'Active Open'
      });
    });

    // 2. Application received events
    applications.forEach(app => {
      const relatedPost = posts.find(p => p.id === app.postId);
      list.push({
        id: `event_app_${app.id}`,
        type: 'APPLICATION_RECEIVED',
        title: `Proposal Received from ${app.tutorName}`,
        description: `Offered ৳ ${app.proposedSalary.toLocaleString()}/mo for "${relatedPost?.title || 'tuition post'}". Schedule: ${app.availableSchedule}`,
        timestamp: app.createdAt || new Date().toISOString(),
        statusBadge: app.status === 'ACCEPTED' ? 'Accepted' : app.status === 'REJECTED' ? 'Declined' : 'Pending Review'
      });
    });

    // 3. Match acceptance events
    applications.filter(a => a.status === 'ACCEPTED').forEach(app => {
      const relatedPost = posts.find(p => p.id === app.postId);
      list.push({
        id: `event_match_${app.id}`,
        type: 'MATCH_ACCEPTED',
        title: `Tutor Match Accepted: ${app.tutorName} 🎉`,
        description: `Direct contact phone & WhatsApp unlocked for tuition "${relatedPost?.title || 'Requirement'}".`,
        timestamp: app.acceptedAt || app.createdAt || new Date().toISOString(),
        statusBadge: 'Match Complete'
      });
    });

    // Sort descending by timestamp
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [posts, applications]);

  if (timelineEvents.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500 space-y-2">
        <Clock className="w-8 h-8 mx-auto text-slate-600" />
        <p className="text-sm font-semibold text-slate-400">No activity logged yet.</p>
        <p className="text-xs text-slate-500">
          Your posts, teacher applications, and tutor acceptance records will be tracked here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono border-b border-blue-950/60 pb-2">
        <span>Timeline of Student Actions & Inquiries</span>
        <span>{timelineEvents.length} Recorded Events</span>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-900/40">
        {timelineEvents.map((item) => {
          const isMatch = item.type === 'MATCH_ACCEPTED';
          const isApp = item.type === 'APPLICATION_RECEIVED';
          const isPost = item.type === 'POST_CREATED';

          return (
            <div key={item.id} className="relative group">
              {/* Timeline Bullet Node */}
              <div
                className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isMatch
                    ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-md shadow-emerald-500/40'
                    : isApp
                    ? 'bg-blue-500 border-blue-300 text-white shadow-md shadow-blue-500/40'
                    : 'bg-cyan-600 border-cyan-400 text-slate-950'
                }`}
              >
                {isMatch ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : isApp ? (
                  <Users className="w-2.5 h-2.5" />
                ) : (
                  <BookOpen className="w-2.5 h-2.5" />
                )}
              </div>

              {/* Event Content Box */}
              <div className="bg-[#0B0F19] border border-blue-950/70 rounded-2xl p-3.5 hover:border-blue-800/60 transition-all space-y-1">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <h4 className="font-bold text-xs sm:text-sm text-white">
                    {item.title}
                  </h4>
                  {item.statusBadge && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                        item.statusBadge === 'Match Complete' || item.statusBadge === 'Accepted'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800/60'
                          : item.statusBadge === 'Under Review'
                          ? 'bg-amber-950 text-amber-400 border-amber-800/60'
                          : 'bg-blue-950 text-blue-400 border-blue-800/60'
                      }`}
                    >
                      {item.statusBadge}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 pt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
