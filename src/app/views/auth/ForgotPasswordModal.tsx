import { Eye, EyeOff, KeyRound, RefreshCw, X } from "lucide-react";
import { useAppContext } from "../../AppContext";
import type { ForgotPasswordModalProps } from "./AuthTypes";

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const {
    setForgotPasswordSuccessMsg,
    forgotPasswordSuccessMsg,
    newPasswordAfterReset,
    setNewPasswordAfterReset,
    showResetPassword,
    setShowResetPassword,
    handleApplyNewPassword,
    forgotPasswordEmail,
    setForgotPasswordEmail,
    forgotPasswordLoading,
    handleForgotPasswordSubmit,
  } = useAppContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white border border-blue-200 rounded-3xl p-6 shadow-2xl relative">
        <button
          type="button"
          onClick={() => {
            onClose();
            setForgotPasswordSuccessMsg(null);
          }}
          className="absolute right-5 top-5 text-slate-500 hover:text-slate-900"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-700">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Reset Password</h3>
            <p className="text-xs text-slate-500">Recover your account credentials</p>
          </div>
        </div>

        {forgotPasswordSuccessMsg ? (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-500/40 text-blue-700 text-xs sm:text-sm">
              {forgotPasswordSuccessMsg}
            </div>

            <form onSubmit={handleApplyNewPassword} className="space-y-3">
              <label className="block text-xs font-medium text-slate-600">Create New Password</label>
              <div className="relative">
                <input
                  type={showResetPassword ? "text" : "password"}
                  value={newPasswordAfterReset}
                  onChange={(event) => setNewPasswordAfterReset(event.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="w-full bg-white border border-blue-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  title={showResetPassword ? "Hide password" : "Show password"}
                >
                  {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20">
                Save New Password &amp; Continue
              </button>
            </form>
          </div>
        ) : (
          <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter the email address registered with your Porabo account to receive password reset instructions.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Registered Email</label>
              <input
                type="email"
                value={forgotPasswordEmail}
                onChange={(event) => setForgotPasswordEmail(event.target.value)}
                placeholder="e.g. farhana.math@example.com"
                required
                className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm">
                Cancel
              </button>
              <button type="submit" disabled={forgotPasswordLoading} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5">
                {forgotPasswordLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
