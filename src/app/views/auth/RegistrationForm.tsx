import { RefreshCw, UserPlus } from "lucide-react";
import { DistrictSelect } from "../../../components/DistrictSelect";
import { useAppContext } from "../../AppContext";
import type { UserGender } from "../../../lib/types";
import type { RegistrationFormProps } from "./AuthTypes";
import { RegistrationMediaFields } from "./RegistrationMediaFields";
import { TeacherCredentialRegistration } from "./TeacherCredentialRegistration";

export function RegistrationForm({ onSwitchToLogin }: RegistrationFormProps) {
  const {
    authRoleChoice,
    registerName,
    setRegisterName,
    registerEmail,
    setRegisterEmail,
    registerPhone,
    setRegisterPhone,
    registerGuardianName,
    setRegisterGuardianName,
    registerGuardianPhone,
    setRegisterGuardianPhone,
    registerGender,
    setRegisterGender,
    registerDistrict,
    setRegisterDistrict,
    registerArea,
    setRegisterArea,
    registerStudentInstitution,
    setRegisterStudentInstitution,
    registerPassword,
    setRegisterPassword,
    registerConfirmPassword,
    setRegisterConfirmPassword,
    showRegisterPassword,
    setRegTeacherDocStep,
    authLoading,
    handleRegisterSubmit,
  } = useAppContext();

  return (
    <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
          <input type="text" value={registerName} onChange={(event) => setRegisterName(event.target.value)} placeholder="e.g. Farhana Khanom" required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Gender</label>
          <select value={registerGender} onChange={(event) => setRegisterGender(event.target.value as UserGender)} className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none">
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
          <input type="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} placeholder="your.email@example.com" required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Phone (+880)</label>
          <input type="tel" value={registerPhone} onChange={(event) => setRegisterPhone(event.target.value)} placeholder="+880 1712-XXXXXX" required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Guardian's Name
          </label>
          <input
            type="text"
            value={registerGuardianName}
            onChange={(event) => setRegisterGuardianName(event.target.value)}
            placeholder="Full name"
            maxLength={120}
            autoComplete="name"
            required
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Guardian's Mobile Number
          </label>
          <input
            type="tel"
            value={registerGuardianPhone}
            onChange={(event) => setRegisterGuardianPhone(event.target.value)}
            placeholder="+880 17XX-XXXXXX"
            autoComplete="tel"
            required
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">District (64 Real)</label>
          <DistrictSelect value={registerDistrict} onChange={setRegisterDistrict} placeholder="Select District" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Neighborhood Area</label>
          <input type="text" value={registerArea} onChange={(event) => setRegisterArea(event.target.value)} placeholder="e.g. Dhanmondi 27" required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" />
        </div>
      </div>

      {authRoleChoice === "STUDENT" && (
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">
            School, College, or University
          </label>
          <input
            type="text"
            value={registerStudentInstitution}
            onChange={(event) =>
              setRegisterStudentInstitution(event.target.value)
            }
            placeholder="Enter your current institution"
            maxLength={200}
            required
            className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}

      <RegistrationMediaFields />

      {authRoleChoice === "TUTOR" && (
        <TeacherCredentialRegistration
          onNextStep={(step: 1 | 2 | 3 | 4) => setRegTeacherDocStep(step)}
        />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
          <input type={showRegisterPassword ? "text" : "password"} value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} placeholder="Min 6 chars" required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Confirm Password</label>
          <input type={showRegisterPassword ? "text" : "password"} value={registerConfirmPassword} onChange={(event) => setRegisterConfirmPassword(event.target.value)} placeholder="Re-enter" required className="min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none" />
        </div>
      </div>

      <button type="submit" disabled={authLoading} className="w-full py-3 px-4 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-100 hover:to-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-1">
        {authLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Registering Account...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            <span>
              Register as {authRoleChoice === "STUDENT" ? "Student" : "Teacher"}
            </span>
          </>
        )}
      </button>

      <div className="text-center pt-1">
        <p className="text-xs text-slate-500">
          Already registered?{" "}
          <button type="button" onClick={onSwitchToLogin} className="text-emerald-700 hover:underline font-medium">
            Sign In here
          </button>
        </p>
      </div>
    </form>
  );
}
