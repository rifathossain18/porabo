import {
  Check,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAppContext } from "../../AppContext";
import type { TeacherCredentialRegistrationProps } from "./AuthTypes";

export function TeacherCredentialRegistration({
  onNextStep,
}: TeacherCredentialRegistrationProps) {
  const {
    regTeacherInstitution,
    setRegTeacherInstitution,
    regTeacherDepartment,
    setRegTeacherDepartment,
    regTeacherAcademicYear,
    setRegTeacherAcademicYear,
    regTeacherNidNumber,
    setRegTeacherNidNumber,
    regTeacherStudentIdRoll,
    setRegTeacherStudentIdRoll,
    regTeacherStudentIdReg,
    setRegTeacherStudentIdReg,
    regTeacherDocStep,
    setRegTeacherDocStep,
  } = useAppContext();

  const steps = [
    {
      step: 1,
      label: "Campus",
      complete: !!(regTeacherInstitution && regTeacherDepartment),
    },
    { step: 2, label: "NID No", complete: !!regTeacherNidNumber },
    {
      step: 3,
      label: "Student ID",
      complete: !!(regTeacherStudentIdRoll && regTeacherStudentIdReg),
    },
    { step: 4, label: "Academic", complete: !!regTeacherAcademicYear },
  ] as const;

  return (
    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Teacher Credentials Guide</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-700/60">
          Step {regTeacherDocStep} of 4
        </span>
      </div>

      <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-xl border border-blue-200">
        {steps.map((step) => (
          <button
            key={step.step}
            type="button"
            onClick={() => onNextStep(step.step)}
            className={`py-1.5 rounded-lg text-[10px] font-mono transition-all text-center flex items-center justify-center gap-1 ${
              regTeacherDocStep === step.step
                ? "bg-blue-600 text-white font-bold shadow"
                : step.complete
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{step.label}</span>
            {step.complete && <Check className="w-2.5 h-2.5" />}
          </button>
        ))}
      </div>

      {regTeacherDocStep === 1 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
            Step 1: Enter your current university/college and enrolled department.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Institution Name</label>
              <input
                type="text"
                value={regTeacherInstitution}
                onChange={(event) => setRegTeacherInstitution(event.target.value)}
                placeholder="e.g. University of Dhaka"
                required
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Department</label>
              <input
                type="text"
                value={regTeacherDepartment}
                onChange={(event) => setRegTeacherDepartment(event.target.value)}
                placeholder="e.g. Mathematics / Physics"
                required
                className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button type="button" onClick={() => setRegTeacherDocStep(2)} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1">
              <span>Next: National ID Number</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {regTeacherDocStep === 2 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
            Step 2: Enter your 10, 13, or 17 digit National ID (NID) or official Birth Certificate number.
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">National ID / Birth Registration Number</label>
            <input
              type="text"
              value={regTeacherNidNumber}
              onChange={(event) => setRegTeacherNidNumber(event.target.value)}
              placeholder="e.g. 19984729104829"
              required
              className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono tracking-wider"
            />
          </div>
          <div className="flex justify-between pt-1">
            <button type="button" onClick={() => setRegTeacherDocStep(1)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-xl">Back</button>
            <button type="button" onClick={() => setRegTeacherDocStep(3)} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1">
              <span>Next: Campus Student ID Roll</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {regTeacherDocStep === 3 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-700">
            Step 3: Enter your current institution student roll number and registration number.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Student ID Roll Number</label>
              <input type="text" value={regTeacherStudentIdRoll} onChange={(event) => setRegTeacherStudentIdRoll(event.target.value)} placeholder="e.g. 2021-MAT-042" required className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Student ID Reg Number</label>
              <input type="text" value={regTeacherStudentIdReg} onChange={(event) => setRegTeacherStudentIdReg(event.target.value)} placeholder="e.g. DU-849201" required className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono" />
            </div>
          </div>
          <div className="flex justify-between pt-1">
            <button type="button" onClick={() => setRegTeacherDocStep(2)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-xl">Back</button>
            <button type="button" onClick={() => setRegTeacherDocStep(4)} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1">
              <span>Next: Academic Status</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {regTeacherDocStep === 4 && (
        <div className="space-y-2.5 animate-in fade-in duration-150">
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-500/40 text-[11px] text-emerald-700">
            Step 4: Confirm your academic year / graduating batch status.
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-600 mb-1">Academic Year / Status</label>
            <input type="text" value={regTeacherAcademicYear} onChange={(event) => setRegTeacherAcademicYear(event.target.value)} placeholder="e.g. 4th Year (Graduating 2025)" required className="w-full bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div className="flex justify-between pt-1">
            <button type="button" onClick={() => setRegTeacherDocStep(3)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs rounded-xl">Back</button>
            <span className="text-[11px] text-emerald-700 font-medium self-center flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready to register</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
