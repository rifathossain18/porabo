import type {
  Dispatch,
  FormEventHandler,
  SetStateAction,
} from "react";
import {
  ArrowLeft,
  CheckCircle,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

interface AdminAuthGateProps {
  hasPassword: boolean | null;
  isForgotPassword: boolean;
  setIsForgotPassword: Dispatch<SetStateAction<boolean>>;
  resetSuccess: boolean;
  recoveryCodeInput: string;
  setRecoveryCodeInput: Dispatch<SetStateAction<string>>;
  newPassword: string;
  setNewPassword: Dispatch<SetStateAction<string>>;
  showPasscode: boolean;
  resetError: string | null;
  handleResetPassword: FormEventHandler<HTMLFormElement>;
  isSubmitting: boolean;
  initialPassword: string;
  setInitialPassword: Dispatch<SetStateAction<string>>;
  initialConfirmPassword: string;
  setInitialConfirmPassword: Dispatch<SetStateAction<string>>;
  initialPasswordError: string | null;
  handleInitPassword: FormEventHandler<HTMLFormElement>;
  enteredPasscode: string;
  setEnteredPasscode: Dispatch<SetStateAction<string>>;
  passcodeError: string | null;
  handleLogin: FormEventHandler<HTMLFormElement>;
  recoveryCodeModal: string | null;
  setRecoveryCodeModal: Dispatch<SetStateAction<string | null>>;
  setIsAdminAuthenticated: Dispatch<SetStateAction<boolean>>;
  onExitAdmin: () => void;
}

export function AdminAuthGate({
  hasPassword,
  isForgotPassword,
  setIsForgotPassword,
  resetSuccess,
  recoveryCodeInput,
  setRecoveryCodeInput,
  newPassword,
  setNewPassword,
  showPasscode,
  resetError,
  handleResetPassword,
  isSubmitting,
  initialPassword,
  setInitialPassword,
  initialConfirmPassword,
  setInitialConfirmPassword,
  initialPasswordError,
  handleInitPassword,
  enteredPasscode,
  setEnteredPasscode,
  passcodeError,
  handleLogin,
  recoveryCodeModal,
  setRecoveryCodeModal,
  setIsAdminAuthenticated,
  onExitAdmin,
}: AdminAuthGateProps) {
  if (hasPassword === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="font-mono text-sm">
          Connecting to secure admin gateway...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-blue-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 text-blue-700 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {hasPassword
                ? "Authorized Personnel Only"
                : "Initial Security Setup"}
            </span>
            <h1 className="text-2xl font-black text-white mt-2">
              {!hasPassword
                ? "Initialize Admin Password"
                : "Porabo Admin Console"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {!hasPassword
                ? "Create a master password."
                : "Enter your master password."}
            </p>
          </div>
        </div>

        {isForgotPassword ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {resetSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-500/40 rounded-xl text-center space-y-2">
                <CheckCircle className="w-8 h-8 text-emerald-700 mx-auto" />
                <p className="text-sm font-bold text-emerald-700">
                  Password Reset Successful!
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Recovery Code
                  </label>
                  <input
                    type="text"
                    value={recoveryCodeInput}
                    onChange={(event) =>
                      setRecoveryCodeInput(event.target.value.toUpperCase())
                    }
                    placeholder="e.g. A1B2C3D4"
                    required
                    className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 font-mono tracking-widest text-center uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    New Password
                  </label>
                  <input
                    type={showPasscode ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                {resetError && (
                  <div className="text-xs text-rose-700 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                    {resetError}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold disabled:opacity-50"
                  >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
          </form>
        ) : !hasPassword ? (
          <form onSubmit={handleInitPassword} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Master Password
              </label>
              <input
                type={showPasscode ? "text" : "password"}
                value={initialPassword}
                onChange={(event) => setInitialPassword(event.target.value)}
                required
                autoFocus
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Confirm Password
              </label>
              <input
                type={showPasscode ? "text" : "password"}
                value={initialConfirmPassword}
                onChange={(event) =>
                  setInitialConfirmPassword(event.target.value)
                }
                required
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            {initialPasswordError && (
              <div className="text-xs text-rose-700 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                {initialPasswordError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {isSubmitting ? "Saving..." : "Save Password & Enter"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Master Password
              </label>
              <input
                type={showPasscode ? "text" : "password"}
                value={enteredPasscode}
                onChange={(event) => setEnteredPasscode(event.target.value)}
                placeholder="••••••••"
                required
                autoFocus
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            {passcodeError && (
              <div className="text-xs text-rose-700 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30">
                {passcodeError}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {isSubmitting ? "Verifying..." : "Log In"}
            </button>
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-xs text-blue-700 hover:text-blue-700"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-slate-200 text-center">
          <button
            onClick={onExitAdmin}
            className="text-slate-500 hover:text-slate-900 text-xs flex items-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Porabo App
          </button>
        </div>
      </div>

      {recoveryCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-emerald-500/50 rounded-3xl p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-500/30">
              <KeyRound className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Save Your Recovery Code
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                This is the ONLY way to reset your password if forgotten.
              </p>
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 py-4 rounded-xl tracking-widest select-all">
              {recoveryCodeModal}
            </div>
            <button
              onClick={() => {
                setRecoveryCodeModal(null);
                setIsAdminAuthenticated(true);
                sessionStorage.setItem("porabo_admin_auth", "true");
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm"
            >
              I have saved it. Enter Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
