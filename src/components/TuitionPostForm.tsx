import React, { useState } from "react";
import {
  PlusCircle,
  X,
  Calendar,
  Clock,
  Video,
  Home,
  Sparkles,
  Check,
} from "lucide-react";
import { DistrictSelect } from "./DistrictSelect";
import { SUBJECT_OPTIONS, GRADE_OPTIONS } from "../lib/mockData";
import { TuitionPost, TuitionMode, WeekDay } from "../lib/types";

interface TuitionPostFormProps {
  onClose: () => void;
  onSubmit: (
    postData: Omit<
      TuitionPost,
      | "id"
      | "createdAt"
      | "studentId"
      | "studentName"
      | "status"
      | "approvalStatus"
      | "isSystemPost"
      | "isFoundTutor"
      | "latitude"
      | "longitude"
    >
  ) => void;
}

const WEEK_DAYS: Array<{ key: WeekDay; label: string; short: string }> = [
  { key: "SAT", label: "Saturday", short: "Sat" },
  { key: "SUN", label: "Sunday", short: "Sun" },
  { key: "MON", label: "Monday", short: "Mon" },
  { key: "TUE", label: "Tuesday", short: "Tue" },
  { key: "WED", label: "Wednesday", short: "Wed" },
  { key: "THU", label: "Thursday", short: "Thu" },
  { key: "FRI", label: "Friday", short: "Fri" },
];

const TUITION_MODE_OPTIONS: Array<{
  key: TuitionMode;
  label: string;
  icon: React.FC<{ className?: string }>;
  desc: string;
}> = [
  { key: "ONLINE", label: "Online", icon: Video, desc: "Zoom / Google Meet" },
  { key: "OFFLINE", label: "Offline", icon: Home, desc: "Home visit" },
  { key: "BOTH", label: "Both", icon: Sparkles, desc: "Flexible" },
];

export const TuitionPostForm: React.FC<TuitionPostFormProps> = ({
  onClose,
  onSubmit,
}) => {
  // ── Core fields ──
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Higher Math");
  const [gradeLevel, setGradeLevel] = useState("Class 9-10 (SSC)");
  const [curriculum, setCurriculum] = useState("English Version");
  const [budget, setBudget] = useState(9000);
  const [district, setDistrict] = useState("Dhaka");
  const [area, setArea] = useState("Dhanmondi 27");
  const [address, setAddress] = useState(
    "House 42, Road 8/A, Block D, Apt 3-B"
  );

  // ── 🆕 Tuition Mode ──
  const [tuitionMode, setTuitionMode] = useState<TuitionMode>("OFFLINE");

  // ── 🆕 Weekly Schedule ──
  const [schedule, setSchedule] = useState<
    Array<{ day: WeekDay; startTime: string; endTime: string }>
  >([]);

  const [formError, setFormError] = useState<string | null>(null);

  // ── Handlers ──
  const toggleDay = (dayKey: WeekDay) => {
    setSchedule((prev) => {
      const exists = prev.find((s) => s.day === dayKey);
      if (exists) return prev.filter((s) => s.day !== dayKey);
      return [
        ...prev,
        { day: dayKey, startTime: "16:30", endTime: "18:00" },
      ];
    });
  };

  const updateTime = (
    dayKey: WeekDay,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((s) => (s.day === dayKey ? { ...s, [field]: value } : s))
    );
  };

  const computeHoursPerDay = (): number => {
    if (schedule.length === 0) return 1.5;
    const first = schedule[0];
    const [sh, sm] = first.startTime.split(":").map(Number);
    const [eh, em] = first.endTime.split(":").map(Number);
    const hours = eh + em / 60 - (sh + sm / 60);
    return hours > 0 ? Math.round(hours * 10) / 10 : 1.5;
  };

  const validateSchedule = (): string | null => {
    if (tuitionMode === "OFFLINE" || tuitionMode === "BOTH") {
      if (schedule.length === 0) {
        return "Please select at least one day for the weekly schedule.";
      }
    }
    for (const slot of schedule) {
      if (!slot.startTime || !slot.endTime) {
        return "Please set start and end time for all selected days.";
      }
      if (slot.startTime >= slot.endTime) {
        return `Invalid time for ${slot.day}: end time must be after start time.`;
      }
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Please enter a title.");
      return;
    }

    const scheduleError = validateSchedule();
    if (scheduleError) {
      setFormError(scheduleError);
      return;
    }

    onSubmit({
      title: title.trim(),
      subject,
      gradeLevel,
      curriculum,
      daysPerWeek: schedule.length || 3,
      hoursPerDay: computeHoursPerDay(),
      salaryBudget: budget,
      genderPreference: "ANY",
      tuitionMode,
      weeklySchedule: schedule.sort(
        (a, b) =>
          WEEK_DAYS.findIndex((w) => w.key === a.day) -
          WEEK_DAYS.findIndex((w) => w.key === b.day)
      ),
      district,
      areaName: area,
      exactAddress: address,
      specialRequirements: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-lg text-white mb-1">
          Post Tuition Requirement
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Fill in details. Posts are reviewed by admin for safety.
        </p>

        {/* Error Banner */}
        {formError && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Class 10 Higher Math & Physics Mentor"
              required
              className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Subject + Grade */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {SUBJECT_OPTIONS.filter((s) => s !== "All Subjects").map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
                <option value="All Subjects">All Subjects (General)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                {GRADE_OPTIONS.filter((g) => g !== "All Grades").map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Curriculum + Budget */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Curriculum
              </label>
              <select
                value={curriculum}
                onChange={(e) => setCurriculum(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="English Version">English Version</option>
                <option value="Bangla Medium">Bangla Medium</option>
                <option value="Cambridge International">
                  Cambridge International
                </option>
                <option value="Edexcel">Edexcel</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Monthly Budget (৳)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                required
                min={500}
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 🆕 TUITION MODE */}
          <div className="p-3.5 rounded-2xl bg-white border border-blue-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              Tuition Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TUITION_MODE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isSelected = tuitionMode === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setTuitionMode(opt.key)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500/30"
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isSelected ? "text-blue-700" : "text-slate-500"
                        }`}
                      />
                      {isSelected && (
                        <Check className="w-3 h-3 text-blue-700" />
                      )}
                    </div>
                    <div className="text-xs font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🆕 WEEKLY SCHEDULE */}
          <div className="p-3.5 rounded-2xl bg-white border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                Weekly Schedule
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                {schedule.length} day{schedule.length !== 1 ? "s" : ""} selected
              </span>
            </div>

            {/* Day Picker */}
            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((d) => {
                const isSelected = schedule.some((s) => s.day === d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDay(d.key)}
                    className={`py-2 rounded-lg text-[10px] font-bold transition-all ${
                      isSelected
                        ? "bg-blue-500 text-slate-950 shadow-md shadow-blue-500/30"
                        : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200"
                    }`}
                  >
                    {d.short}
                  </button>
                );
              })}
            </div>

            {/* Time Range per selected day */}
            {schedule.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                {schedule.map((entry) => {
                  const dayLabel =
                    WEEK_DAYS.find((w) => w.key === entry.day)?.label ||
                    entry.day;
                  return (
                    <div
                      key={entry.day}
                      className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200"
                    >
                      <span className="text-xs font-semibold text-blue-700 w-20 shrink-0">
                        {dayLabel}
                      </span>
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) =>
                          updateTime(entry.day, "startTime", e.target.value)
                        }
                        className="bg-white border border-blue-200 text-white text-xs rounded-lg px-2 py-1 [color-scheme:light]"
                      />
                      <span className="text-slate-500 text-xs">to</span>
                      <input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) =>
                          updateTime(entry.day, "endTime", e.target.value)
                        }
                        className="bg-white border border-blue-200 text-white text-xs rounded-lg px-2 py-1 [color-scheme:light]"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* District + Area */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <DistrictSelect
                value={district}
                onChange={setDistrict}
                label="District (Search 64 Districts)"
                placeholder="Search Bangladesh districts..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Neighborhood Area
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Dhanmondi 27"
                required
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Exact Address (only if not pure ONLINE) */}
          {tuitionMode !== "ONLINE" && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Exact Address (Protected - Unlocks only when tutor accepted)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. House 42, Road 8/A, Apt 3-B"
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Tuition Request</span>
          </button>
        </form>
      </div>
    </div>
  );
};