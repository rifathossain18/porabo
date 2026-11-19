import { Phone, Search, LogOut, X, Eye, User as UserIcon, Bell, MoreVertical } from "lucide-react";
import { Area } from "recharts";
import { User } from "../../../lib/types";
import { NotificationPanel } from "../../../components/NotificationPanel";
import { useAppContext } from "../../AppContext";

export function DashboardHeader() {
  const {
    globalSearchQuery,
    setGlobalSearchQuery,
    setTeacherViewMode,
    currentUser,
    isNotificationPanelOpen,
    setIsNotificationPanelOpen,
    notifications,
    setNotifications,
    setIsMobileMenuOpen,
    userNotifications,
    unreadNotifCount,
    handleLogout,
    handleOpenTeacherProfile,
    handleOpenProfileModal,
  } = useAppContext();
  if (!currentUser) return null;
  return (
    <>
              {/* Main Top Header */}
              <header className="sticky top-0 z-40 border-b border-blue-200 bg-white backdrop-blur-md px-3 sm:px-6 py-2.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                  {/* Logo & Brand */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-700 bg-blue-600 p-1 sm:h-11 sm:w-11">
                      <img
                        src="/assets/porabo_logo.webp"
                        alt="Porabo Logo"
                        width={36}
                        height={36}
                        decoding="async"
                        className="h-8 w-8 object-contain drop-shadow-[0_0_1px_rgba(255,255,255,0.9)] sm:h-9 sm:w-9"
                      />
                    </div>
                    <div>
                      <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                        Porabo
                      </span>
                      <span className="hidden lg:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        Neighborhood Tutor Network
                      </span>
                    </div>
                  </div>
        
                  {/* REAL-TIME GLOBAL SEARCH BAR IN HEADER (ONLY FOR TUTOR ROLE) */}
                  {currentUser.role === "TUTOR" ? (
                    <div className="flex-1 max-w-md mx-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={globalSearchQuery}
                          onChange={(e) => setGlobalSearchQuery(e.target.value)}
                          placeholder="Search by subject, title, area, or curriculum..."
                          className="w-full bg-white border border-blue-200 hover:border-blue-200 focus:border-blue-500 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                        />
                        {globalSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setGlobalSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1" />
                  )}
        
                  {/* User Status, Notifications, Role Badge & Actions */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Notification Bell Button & Dropdown Panel */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsNotificationPanelOpen((prev) => !prev)}
                        className={`p-2 rounded-xl border transition-all relative ${
                          isNotificationPanelOpen
                            ? "bg-blue-600/30 text-blue-700 border-blue-500/50"
                            : "bg-white text-slate-600 hover:text-slate-900 border-blue-200 hover:border-blue-700/60"
                        }`}
                        title="Notifications"
                        aria-label="View notifications"
                      >
                        <Bell className="w-4 h-4" />
                        {unreadNotifCount > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse shadow-lg shadow-rose-600/50">
                            {unreadNotifCount > 9 ? "9+" : unreadNotifCount}
                          </span>
                        )}
                      </button>
        
                      <NotificationPanel
                        isOpen={isNotificationPanelOpen}
                        onClose={() => setIsNotificationPanelOpen(false)}
                        notifications={userNotifications}
                        onMarkAsRead={(id) =>
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
                          )
                        }
                        onMarkAllAsRead={() =>
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.userId === currentUser.id ? { ...n, isRead: true } : n,
                            ),
                          )
                        }
                        onDeleteNotification={(id) =>
                          setNotifications((prev) => prev.filter((n) => n.id !== id))
                        }
                        onClearAll={() =>
                          setNotifications((prev) =>
                            prev.filter((n) => n.userId !== currentUser.id),
                          )
                        }
                        onNotificationClick={() => {
                          if (currentUser.role === "TUTOR") {
                            setTeacherViewMode("my_applications");
                          }
                          setIsNotificationPanelOpen(false);
                        }}
                      />
                    </div>
        
                    {/* Strict Role Pill */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-blue-200 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-slate-500">Role:</span>
                      <span className="font-semibold text-white">
                        {currentUser.role === "STUDENT" ? "Student" : "Tutor"}
                      </span>
                    </div>
        
                    {/* Profile & Location Button for BOTH Student and Teacher */}
                    <button
                      type="button"
                      onClick={handleOpenProfileModal}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-700 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors"
                      title="Edit Profile & Location (District, Area, Contact)"
                    >
                      <UserIcon className="w-3.5 h-3.5" />
                      <span>Profile &amp; Location</span>
                    </button>
        
                    {/* If Tutor: View My Public Profile Button */}
                    {currentUser.role === "TUTOR" && (
                      <button
                        type="button"
                        onClick={() => handleOpenTeacherProfile(currentUser.id)}
                        className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl text-xs font-medium transition-colors"
                        title="View Public Teacher Dossier"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-700" />
                        <span>Public Profile</span>
                      </button>
                    )}
        
                    {/* Feedback / Complain Button (Direct WhatsApp to +8801642695161) */}
                    <a
                      href="https://wa.me/8801642695161?text=Hello%20Porabo%20Support%2C%20I%20have%20a%20feedback%20or%20complain"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-700 border border-emerald-600/60 text-xs font-semibold items-center gap-1.5 transition-all shadow-sm"
                      title="Direct WhatsApp Support: +8801642695161"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Feedback &amp; Complaints</span>
                    </a>
        
                    {/* Logout on Desktop */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Sign Out"
                      className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 text-xs items-center gap-1.5 border border-slate-300 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-700" />
                      <span>Sign Out</span>
                    </button>
        
                    {/* Mobile 3-Dot Overflow Menu Button */}
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="sm:hidden p-2 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-blue-200 hover:border-blue-700/60 transition-colors"
                      title="More options"
                      aria-label="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </header>
    </>
  );
}
