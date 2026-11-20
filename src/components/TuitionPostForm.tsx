import React, { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  GraduationCap,
  Home,
  LockKeyhole,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Video,
  X,
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
  { key: "ONLINE", label: "Online", icon: Video, desc: "Learn remotely" },
  { key: "OFFLINE", label: "In person", icon: Home, desc: "At your home" },
  { key: "BOTH", label: "Flexible", icon: Sparkles, desc: "Either works" },
];

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";
const labelClassName = "mb-1.5 block text-xs font-semibold text-slate-700";

export const TuitionPostForm: React.FC<TuitionPostFormProps> = ({
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Higher Math");
  const [gradeLevel, setGradeLevel] = useState("Class 9-10 (SSC)");
  const [curriculum, setCurriculum] = useState("English Version");
  const [budget, setBudget] = useState(9000);
  const [district, setDistrict] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [tuitionMode, setTuitionMode] = useState<TuitionMode>("OFFLINE");
  const [schedule, setSchedule] = useState<
    Array<{ day: WeekDay; startTime: string; endTime: string }>
  >([]);
  const [formError, setFormError] = useState<string | null>(null);

  const toggleDay = (dayKey: WeekDay) => {
    setSchedule((previous) => {
      const exists = previous.some((slot) => slot.day === dayKey);
      if (exists) return previous.filter((slot) => slot.day !== dayKey);
      return [
        ...previous,
        { day: dayKey, startTime: "16:30", endTime: "18:00" },
      ];
    });
  };

  const updateTime = (
    dayKey: WeekDay,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((previous) =>
      previous.map((slot) =>
        slot.day === dayKey ? { ...slot, [field]: value } : slot
      )
    );
  };

  const computeHoursPerDay = (): number => {
    const first = schedule[0];
    if (!first) return 1.5;
    const [startHour, startMinute] = first.startTime.split(":").map(Number);
    const [endHour, endMinute] = first.endTime.split(":").map(Number);
    const hours =
      endHour + endMinute / 60 - (startHour + startMinute / 60);
    return hours > 0 ? Math.round(hours * 10) / 10 : 1.5;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Add a short title so tutors can quickly understand your need.");
      return;
    }
    if (!Number.isFinite(budget) || budget <= 0) {
      setFormError("Enter a monthly budget greater than ৳0.");
      return;
    }
    if (!area.trim()) {
      setFormError("Add your neighborhood so nearby tutors can find this post.");
      return;
    }
    if (tuitionMode !== "ONLINE" && !address.trim()) {
      setFormError("Add the exact address for in-person tuition.");
      return;
    }
    if (
      (tuitionMode === "OFFLINE" || tuitionMode === "BOTH") &&
      schedule.length === 0
    ) {
      setFormError("Choose at least one day for in-person tuition.");
      return;
    }
    for (const slot of schedule) {
      if (!slot.startTime || !slot.endTime || slot.startTime >= slot.endTime) {
        const dayLabel =
          WEEK_DAYS.find((day) => day.key === slot.day)?.label || slot.day;
        setFormError(`Set a valid start and end time for ${dayLabel}.`);
        return;
      }
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
      weeklySchedule: [...schedule].sort(
        (a, b) =>
          WEEK_DAYS.findIndex((day) => day.key === a.day) -
          WEEK_DAYS.findIndex((day) => day.key === b.day)
      ),
      district,
      areaName: area.trim(),
      exactAddress: tuitionMode === "ONLINE" ? "" : address.trim(),
      specialRequirements: "",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="tuition-post-title"
        className="flex max-h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[92vh] sm:max-w-3xl sm:rounded-3xl sm:border sm:border-slate-200"
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h2
                  id="tuition-post-title"
                  className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl"
                >
                  Post a tuition request
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                  <ShieldCheck className="h-3 w-3" />
                  Privacy protected
                </span>
              </div>
              <p className="text-xs leading-5 text-slate-500 sm:text-sm">
                Share a few details to connect with the right nearby tutor.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tuition request form"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/15"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form
          id="tuition-post-form"
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
            {formError && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {formError}
              </div>
            )}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Learning requirements
                  </h3>
                  <p className="text-xs text-slate-500">
                    What should your tutor teach?
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  01
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="tuition-title" className={labelClassName}>
                    Request title
                  </label>
                  <input
                    id="tuition-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Class 10 Higher Math tutor"
                    maxLength={120}
                    required
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="tuition-subject" className={labelClassName}>
                      Subject
                    </label>
                    <select
                      id="tuition-subject"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      className={inputClassName}
                    >
                      {SUBJECT_OPTIONS.filter(
                        (option) => option !== "All Subjects"
                      ).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      <option value="All Subjects">All Subjects (General)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="tuition-grade" className={labelClassName}>
                      Class or grade
                    </label>
                    <select
                      id="tuition-grade"
                      value={gradeLevel}
                      onChange={(event) => setGradeLevel(event.target.value)}
                      className={inputClassName}
                    >
                      {GRADE_OPTIONS.filter(
                        (option) => option !== "All Grades"
                      ).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="tuition-curriculum"
                      className={labelClassName}
                    >
                      Curriculum
                    </label>
                    <select
                      id="tuition-curriculum"
                      value={curriculum}
                      onChange={(event) => setCurriculum(event.target.value)}
                      className={inputClassName}
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
                    <label htmlFor="tuition-budget" className={labelClassName}>
                      Monthly budget
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm font-semibold text-slate-500">
                        ৳
                      </span>
                      <input
                        id="tuition-budget"
                        type="number"
                        value={budget}
                        onChange={(event) =>
                          setBudget(Number(event.target.value))
                        }
                        min={1}
                        step={100}
                        required
                        className={`${inputClassName} pl-8`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <Calendar className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lesson format & schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Choose how and when lessons work for you.
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  02
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {TUITION_MODE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = tuitionMode === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setTuitionMode(option.key)}
                      className={`rounded-xl border p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-800 ring-1 ring-blue-500/15"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="mb-2 flex items-center justify-between">
                        <Icon className="h-4 w-4" />
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="block text-xs font-bold sm:text-sm">
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-500 sm:text-xs">
                        {option.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {tuitionMode !== "ONLINE" && (
                <div className="mt-4 rounded-xl bg-slate-50 p-3.5 sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        Weekly availability
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        Select days, then set a convenient time.
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                      {schedule.length} selected
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {WEEK_DAYS.map((day) => {
                      const isSelected = schedule.some(
                        (slot) => slot.day === day.key
                      );
                      return (
                        <button
                          key={day.key}
                          type="button"
                          aria-label={day.label}
                          aria-pressed={isSelected}
                          onClick={() => toggleDay(day.key)}
                          className={`rounded-lg py-2 text-[10px] font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-500/10 sm:text-xs ${
                            isSelected
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                          }`}
                        >
                          {day.short}
                        </button>
                      );
                    })}
                  </div>

                  {schedule.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                      {schedule.map((slot) => {
                        const dayLabel =
                          WEEK_DAYS.find((day) => day.key === slot.day)?.label ||
                          slot.day;
                        return (
                          <div
                            key={slot.day}
                            className="grid grid-cols-[minmax(0,1fr)_1fr_auto_1fr] items-center gap-2"
                          >
                            <span className="truncate text-xs font-semibold text-slate-700">
                              {dayLabel}
                            </span>
                            <input
                              type="time"
                              aria-label={`${dayLabel} start time`}
                              value={slot.startTime}
                              onChange={(event) =>
                                updateTime(slot.day, "startTime", event.target.value)
                              }
                              className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                            <span className="text-[10px] text-slate-400">to</span>
                            <input
                              type="time"
                              aria-label={`${dayLabel} end time`}
                              value={slot.endTime}
                              onChange={(event) =>
                                updateTime(slot.day, "endTime", event.target.value)
                              }
                              className="min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <MapPin className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Where lessons happen
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your neighborhood is public; your exact address stays private.
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  03
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <DistrictSelect
                  value={district}
                  onChange={setDistrict}
                  label="District"
                  placeholder="Choose a district"
                />
                <div>
                  <label htmlFor="tuition-area" className={labelClassName}>
                    Neighborhood / area
                  </label>
                  <input
                    id="tuition-area"
                    type="text"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    placeholder="e.g. Dhanmondi 27"
                    maxLength={150}
                    required
                    className={inputClassName}
                  />
                </div>
              </div>

              {tuitionMode !== "ONLINE" && (
                <div className="mt-3">
                  <label htmlFor="tuition-address" className={labelClassName}>
                    Exact address
                  </label>
                  <div className="relative">
                    <input
                      id="tuition-address"
                      type="text"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      placeholder="House, road, building (not shown publicly)"
                      maxLength={300}
                      required
                      className={`${inputClassName} pr-11`}
                    />
                    <LockKeyhole className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-slate-500">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    Only shared with the tutor you accept. Tutors see your area,
                    never your full address, before then.
                  </p>
                </div>
              )}
            </section>
          </div>

          <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="hidden items-center gap-1.5 text-xs text-slate-500 sm:flex">
              <Clock className="h-3.5 w-3.5" />
              Takes about 2 minutes
            </p>
            <div className="flex gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-500/10 sm:flex-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_-6px_rgba(37,99,235,0.65)] transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 sm:flex-none"
              >
                <PlusCircle className="h-4 w-4" />
                Publish request
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
};
