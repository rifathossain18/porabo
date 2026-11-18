import { RefreshCw, UserPlus } from "lucide-react";
import { DistrictSelect } from "../../../components/DistrictSelect";
import { useAppContext } from "../../AppContext";
import type { UserGender } from "../../../lib/types";
import type { RegistrationFormProps } from "./AuthTypes";
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
    registerGender,
    setRegisterGender,
    registerDistrict,
    setRegisterDistrict,
    registerArea,
    setRegisterArea,
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
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
          <input type="text" value={registerName} onChange={(event) => setRegisterName(event.target.value)} placeholder="e.g. Farhana Khanom" required className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Gender</label>
          <select value={registerGender} onChange={(event) => setRegisterGender(event.target.value as UserGender)} className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500">
            <option value="MALE">Male (Vector Scholar Avatar)</option>
            <option value="FEMALE">Female (Vector Scholar Avatar)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
          <input type="email" value={registerEmail} onChange={(event) => setRegisterEmail(event.target.value)} placeholder="your.email@example.com" required className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Phone (+880)</label>
          <input type="tel" value={registerPhone} onChange={(event) => setRegisterPhone(event.target.value)} placeholder="+880 1712-XXXXXX" required className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">District (64 Real)</label>
          <DistrictSelect value={registerDistrict} onChange={setRegisterDistrict} placeholder="Select District" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Neighborhood Area</label>
          <input type="text" value={registerArea} onChange={(event) => setRegisterArea(event.target.value)} placeholder="e.g. Dhanmondi 27" required className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {authRoleChoice === "TUTOR" && (
        <TeacherCredentialRegistration
          onNextStep={(step: 1 | 2 | 3 | 4) => setRegTeacherDocStep(step)}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
          <input type={showRegisterPassword ? "text" : "password"} value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} placeholder="Min 6 chars" required className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
          <input type={showRegisterPassword ? "text" : "password"} value={registerConfirmPassword} onChange={(event) => setRegisterConfirmPassword(event.target.value)} placeholder="Re-enter" required className="w-full bg-[#0B0F19] border border-blue-950/60 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <button type="submit" disabled={authLoading} className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-1">
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
        <p className="text-xs text-slate-400">
          Already registered?{" "}
          <button type="button" onClick={onSwitchToLogin} className="text-blue-400 hover:underline font-medium">
            Sign In here
          </button>
        </p>
      </div>
    </form>
  );
}
