import { AlertTriangle, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { useAppContext } from "../../AppContext";
import { Toast } from "../../../components/Toast";
import { LoginForm } from "./LoginForm";
import { RegistrationForm } from "./RegistrationForm";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

export function AuthenticationGateView() {
  const {
    authRoleChoice,
    authViewTab,
    setAuthViewTab,
    setAuthError,
    authError,
    setShowAuthForm,
    toastMessage,
    setToastMessage,
    isForgotPasswordOpen,
    setIsForgotPasswordOpen,
  } = useAppContext();

  const isLogin = authViewTab === "login";
  const isTutor = authRoleChoice === "TUTOR";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <header className="border-b border-blue-200 bg-white backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-700 bg-blue-600 p-1">
            <img
              src="/assets/porabo_logo.webp"
              alt="Porabo Logo"
              width={36}
              height={36}
              decoding="async"
              className="h-9 w-9 object-contain drop-shadow-[0_0_1px_rgba(255,255,255,0.9)]"
            />
          </div>
            <div>
              <span className="font-extrabold text-xl text-white tracking-tight">Porabo</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                Hyper-Local Tutor Network
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5 text-blue-700">
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Verified Credentials Only</span>
            </span>
            <button type="button" onClick={() => setShowAuthForm(false)} className="text-slate-500 hover:text-slate-900 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors" title="Back to landing">
              ← Back
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-lg bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40">
          <div className="text-center mb-6">
            <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-700 bg-blue-600 p-1.5 shadow-sm">
              <img
                src="/assets/porabo_logo.webp"
                alt="Porabo Logo"
                width={48}
                height={48}
                decoding="async"
                className="h-12 w-12 object-contain drop-shadow-[0_0_1px_rgba(255,255,255,0.9)]"
              />
            </div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider mb-2 border ${isTutor ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
              {isTutor ? (
                <>
                  <GraduationCap className="w-3 h-3" />
                  <span>Teacher Portal</span>
                </>
              ) : (
                <>
                  <Users className="w-3 h-3" />
                  <span>Guardian / Student Portal</span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isLogin
                ? isTutor
                  ? "Teacher Sign In"
                  : "Guardian Sign In"
                : isTutor
                  ? "Create Teacher Account"
                  : "Create Guardian Account"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              {isLogin
                ? isTutor
                  ? "Sign in to your teacher account to find local tuition opportunities."
                  : "Sign in to post tuition requirements and hire verified tutors."
                : isTutor
                  ? "Join as a verified tutor. Zero commission, zero ads fee — keep 100% of what you earn."
                  : "Create a free account to find verified tutors within walking distance of your home."}
            </p>
          </div>

          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-700" />
              <div className="flex-1">{authError}</div>
            </div>
          )}

          <div className="grid grid-cols-2 p-1 bg-white rounded-2xl border border-blue-200 mb-6">
            <button type="button" onClick={() => { setAuthViewTab("login"); setAuthError(null); }} className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${isLogin ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-500 hover:text-slate-900"}`}>
              Sign In
            </button>
            <button type="button" onClick={() => { setAuthViewTab("register"); setAuthError(null); }} className={`py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${!isLogin ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : "text-slate-500 hover:text-slate-900"}`}>
              Register
            </button>
          </div>

          {isLogin ? (
            <LoginForm onSwitchToRegister={() => { setAuthViewTab("register"); setAuthError(null); }} />
          ) : (
            <RegistrationForm onSwitchToLogin={() => { setAuthViewTab("login"); setAuthError(null); }} />
          )}
        </div>
      </main>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />

      <footer className="border-t border-blue-200 bg-white py-4 text-center text-xs text-slate-500 font-mono">
        Porabo &copy; 2026 &bull; Hyper-Local Radius Tuition Platform &bull; All Rights Reserved
      </footer>
    </div>
  );
}
