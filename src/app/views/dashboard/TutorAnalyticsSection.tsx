import { CheckCircle2, Send, Clock, Zap, BarChart3, TrendingUp, Activity } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts";
import { useAppContext } from "../../AppContext";

export function TutorAnalyticsSection() {
  const {
    teacherViewMode,
    applications,
    trends30Days,
    analyticsData,
    currentUser,
  } = useAppContext();
  if (!currentUser || currentUser.role !== "TUTOR") return null;
  return (
    <>
      {/* VIEW MODE: COMPREHENSIVE TEACHER ANALYTICS SUITE (RECHARTS) */}
                    {teacherViewMode === "trends" && (
                      <div className="space-y-6">
                        {/* 1. KPI Conversion & Engagement Summary Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                          <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                              <span>Total Applied</span>
                              <Send className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                                {analyticsData.totalApplied}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Submitted tuition bids
                              </p>
                            </div>
                          </div>
        
                          <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                              <span>In Review</span>
                              <Clock className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                                {analyticsData.inReviewCount}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Guardian screening queue
                              </p>
                            </div>
                          </div>
        
                          <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                              <span>Matches Accepted</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div>
                              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                                {analyticsData.acceptedCount}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Direct contact unlocked
                              </p>
                            </div>
                          </div>
        
                          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
                            <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                              <span>Conversion Rate</span>
                              <TrendingUp className="w-4 h-4 text-blue-700" />
                            </div>
                            <div>
                              <div className="text-2xl sm:text-3xl font-extrabold text-blue-700">
                                {analyticsData.conversionRate}%
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Application acceptance yield
                              </p>
                            </div>
                          </div>
                        </div>
        
                        {/* 2. Visual Funnel: Application Conversion Stages */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          <div className="bg-white border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                              <div>
                                <h3 className="font-bold text-base text-white flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-blue-700" />
                                  <span>Application Conversion Funnel</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Stage-by-stage progression from proposal to student
                                  match
                                </p>
                              </div>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                Real-time Data
                              </span>
                            </div>
        
                            <div className="w-full h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={analyticsData.funnelData}
                                  margin={{ top: 20, right: 20, left: -10, bottom: 5 }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1e293b"
                                  />
                                  <XAxis
                                    dataKey="stage"
                                    stroke="#64748b"
                                    tick={{ fontSize: 11 }}
                                  />
                                  <YAxis
                                    stroke="#64748b"
                                    tick={{ fontSize: 11 }}
                                    allowDecimals={false}
                                  />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#0f172a",
                                      borderColor: "#1e3a8a",
                                      borderRadius: "12px",
                                      color: "#fff",
                                      fontSize: "12px",
                                    }}
                                  />
                                  <Bar
                                    dataKey="count"
                                    name="Count"
                                    radius={[8, 8, 0, 0]}
                                  >
                                    {analyticsData.funnelData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
        
                            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                              {analyticsData.funnelData.map((f) => (
                                <div
                                  key={f.stage}
                                  className="p-2 rounded-xl bg-white border border-blue-200"
                                >
                                  <div className="font-bold text-white">{f.count}</div>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    {f.stage}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
        
                          {/* 3. Hourly Engagement Patterns */}
                          <div className="bg-white border border-blue-200 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                              <div>
                                <h3 className="font-bold text-base text-white flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-700" />
                                  <span>Hourly Engagement &amp; Inquiry Windows</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Peak neighborhood tuition activity &amp; proposal
                                  submission response
                                </p>
                              </div>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                Peak: 17:00 - 21:00
                              </span>
                            </div>
        
                            <div className="w-full h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={analyticsData.hourlyData}
                                  margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#1e293b"
                                  />
                                  <XAxis
                                    dataKey="period"
                                    stroke="#64748b"
                                    tick={{ fontSize: 10 }}
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                  />
                                  <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "#0f172a",
                                      borderColor: "#1e3a8a",
                                      borderRadius: "12px",
                                      color: "#fff",
                                      fontSize: "12px",
                                    }}
                                  />
                                  <Bar
                                    dataKey="engagementScore"
                                    name="Engagement Index %"
                                    fill="#06b6d4"
                                    radius={[6, 6, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
        
                            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-700 shrink-0" />
                              <span>
                                <strong>Pro Tip:</strong> 68% of guardians review and
                                accept proposals between 5:00 PM and 9:00 PM. Submitting
                                proposals during this window increases your matching
                                speed.
                              </span>
                            </div>
                          </div>
                        </div>
        
                        {/* 4. Profile View Trends by Date (30-Day Area Chart) */}
                        <div className="bg-white border border-blue-200 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                            <div>
                              <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-700" />
                                <span>
                                  Profile View Trends &amp; Guardian Reach (30 Days)
                                </span>
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                Daily student and parent impressions on your verified
                                teacher dossier
                              </p>
                            </div>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="flex items-center gap-1.5 text-blue-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />{" "}
                                Applications
                              </span>
                              <span className="flex items-center gap-1.5 text-blue-700">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />{" "}
                                Profile Views
                              </span>
                            </div>
                          </div>
        
                          <div className="w-full h-72 sm:h-80 -ml-2 sm:ml-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={trends30Days}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient
                                    id="colorViews"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#06b6d4"
                                      stopOpacity={0.4}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#06b6d4"
                                      stopOpacity={0.0}
                                    />
                                  </linearGradient>
                                  <linearGradient
                                    id="colorApps"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                  >
                                    <stop
                                      offset="5%"
                                      stopColor="#3b82f6"
                                      stopOpacity={0.4}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="#3b82f6"
                                      stopOpacity={0.0}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis
                                  dataKey="date"
                                  stroke="#64748b"
                                  tick={{ fontSize: 11 }}
                                />
                                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#0f172a",
                                    borderColor: "#1e3a8a",
                                    borderRadius: "12px",
                                    color: "#fff",
                                    fontSize: "12px",
                                  }}
                                />
                                <Area
                                  type="monotone"
                                  dataKey="profileViews"
                                  name="Profile Views"
                                  stroke="#06b6d4"
                                  strokeWidth={2.5}
                                  fillOpacity={1}
                                  fill="url(#colorViews)"
                                />
                                <Area
                                  type="monotone"
                                  dataKey="applications"
                                  name="Proposals Submitted"
                                  stroke="#3b82f6"
                                  strokeWidth={2}
                                  fillOpacity={1}
                                  fill="url(#colorApps)"
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    )}
    </>
  );
}
