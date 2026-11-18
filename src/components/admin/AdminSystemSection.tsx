import { Activity, Database, Lock, RefreshCw, Shield } from "lucide-react";
import { cfD1, CLOUDFLARE_D1_SCHEMA, D1DiagnosticLog } from "../../lib/cloudflareD1";

interface AdminSystemSectionProps {
  isCloudflareActive: boolean;
  isSettingsActive: boolean;
  diagnosticLogs: D1DiagnosticLog[];
  onLockSession: () => void;
}

export function AdminSystemSection({
  isCloudflareActive,
  isSettingsActive,
  diagnosticLogs,
  onLockSession,
}: AdminSystemSectionProps) {
  return (
    <>
      {isCloudflareActive && (
        <div className="space-y-4">
          <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
            <h3 className="text-sm font-bold text-white mb-2">SQL Schema</h3>
            <pre className="bg-[#070A12] p-3 rounded-xl text-[10px] font-mono text-slate-300 overflow-auto max-h-96">
              {CLOUDFLARE_D1_SCHEMA}
            </pre>
          </div>
          <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" /> Query Log (
              {diagnosticLogs.length})
            </h3>
            <div className="overflow-auto max-h-72 rounded-xl border border-slate-800">
              <table className="w-full text-[11px] font-mono">
                <thead className="bg-[#0B0F19] text-slate-400 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Operation</th>
                    <th className="p-2 text-left">Latency</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {diagnosticLogs.slice(0, 30).map((log) => (
                    <tr key={log.id}>
                      <td className="p-2 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2 text-cyan-400 truncate max-w-xs">
                        {log.operation}
                      </td>
                      <td className="p-2 text-emerald-400">
                        {log.executionTimeMs}ms
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] ${log.status === "SUCCESS" ? "bg-emerald-950 text-emerald-400" : "bg-rose-950 text-rose-400"}`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isSettingsActive && (
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-[#111827] border border-blue-900/40 rounded-3xl p-5 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-base font-bold text-white">
              Admin Password Security
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Your master password is securely hashed and stored in Cloudflare
              D1.
            </p>
            <button
              onClick={onLockSession}
              className="w-full py-2.5 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" /> Lock Session Now
            </button>
          </div>

          <div className="bg-[#111827] border border-amber-700/50 rounded-3xl p-5 space-y-3">
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-amber-400" />
              Flatten Legacy User Data
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              If admin panel shows blank teacher fields, run this once. It
              converts nested <code>teacherDetails</code> into flat top-level
              fields for all users.
            </p>
            <button
              type="button"
              onClick={migrateUsers}
              className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Run Data Migration
            </button>
          </div>
        </div>
      )}
    </>
  );
}

async function migrateUsers() {
  if (
    !confirm(
      "Migrate all users to flat structure? This is safe and idempotent.",
    )
  ) {
    return;
  }

  const result = await cfD1.migrateUsers();
  if (result.success) {
    alert(
      `✅ Migration complete.\nMigrated: ${result.migrated || 0}/${result.total || 0} users.\n\nRefreshing page to see updated data.`,
    );
    window.location.reload();
  } else {
    alert(`❌ Migration failed: ${result.error || "Unknown error"}`);
  }
}
