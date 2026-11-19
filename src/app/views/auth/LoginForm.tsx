import { Eye, EyeOff, KeyRound, LogIn, Mail, RefreshCw } from "lucide-react";
import { useAppContext } from "../../AppContext";
import type { LoginFormProps } from "./AuthTypes";

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const {
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    setForgotPasswordEmail,
    setIsForgotPasswordOpen,
    authLoading,
    handleLoginSubmit,
  } = useAppContext();

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Email Address</label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="email"
            value={loginEmail}
            onChange={(event) => setLoginEmail(event.target.value)}
            placeholder="e.g. farhana.math@example.com"
            required
            className="w-full bg-white border border-blue-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-600">Password</label>
          <button
            type="button"
            onClick={() => {
              setForgotPasswordEmail(loginEmail);
              setIsForgotPasswordOpen(true);
            }}
            className="text-xs text-blue-700 hover:text-blue-700 transition-colors"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type={showLoginPassword ? "text" : "password"}
            value={loginPassword}
            onChange={(event) => setLoginPassword(event.target.value)}
            placeholder="••••••••"
            required
            className="w-full bg-white border border-blue-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowLoginPassword(!showLoginPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600"
          >
            {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={authLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
      >
        {authLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Verifying Credentials...</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <button type="button" onClick={onSwitchToRegister} className="text-blue-700 hover:underline font-medium">
            Register here
          </button>
        </p>
      </div>
    </form>
  );
}
