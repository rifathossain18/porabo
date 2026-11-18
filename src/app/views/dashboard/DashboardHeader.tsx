import { Phone, Search, LogOut, X, Eye, User as UserIcon, Bell, Sun, Moon, MoreVertical } from "lucide-react";
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
    theme,
    toggleTheme,
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
              <header className="sticky top-0 z-40 border-b border-blue-950/60 bg-[#0B0F19]/90 backdrop-blur-md px-3 sm:px-6 py-2.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
                  {/* Logo & Brand */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <img
                      src="/assets/porabo_logo_transparent_90065b0b.svg"
                      alt="Porabo Logo"
                      className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
                    />
                    <div>
                      <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                        Porabo
                      </span>
                      <span className="hidden lg:inline-block ml-2 text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/50">
                        Neighborhood Tutor Network
                      </span>
                    </div>
                  </div>
        
                  {/* REAL-TIME GLOBAL SEARCH BAR IN HEADER (ONLY FOR TUTOR ROLE) */}
                  {currentUser.role === "TUTOR" ? (
                    <div className="flex-1 max-w-md mx-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={globalSearchQuery}
                          onChange={(e) => setGlobalSearchQuery(e.target.value)}
                          placeholder="Search by subject, title, area, or curriculum..."
                          className="w-full bg-[#111827] border border-blue-950/80 hover:border-blue-800/60 focus:border-blue-500 rounded-full pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all shadow-inner"
                        />
                        {globalSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setGlobalSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                            ? "bg-blue-600/30 text-blue-400 border-blue-500/50"
                            : "bg-[#111827] text-slate-300 hover:text-white border-blue-900/40 hover:border-blue-700/60"
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
        
                    {/* Global CSS Theme Toggle (Sun / Moon) */}
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="p-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-blue-900/40 hover:border-blue-700/60 transition-all shadow-sm"
                      title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode for better accessibility`}
                      aria-label={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
                    >
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Moon className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
        
                    {/* Strict Role Pill */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#111827] border border-blue-900/40 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-slate-400">Role:</span>
                      <span className="font-semibold text-white">
                        {currentUser.role === "STUDENT" ? "Student" : "Tutor"}
                      </span>
                    </div>
        
                    {/* Profile & Location Button for BOTH Student and Teacher */}
                    <button
                      type="button"
                      onClick={handleOpenProfileModal}
                      className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-semibold transition-colors"
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
                        className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 rounded-xl text-xs font-medium transition-colors"
                        title="View Public Teacher Dossier"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                        <span>Public Profile</span>
                      </button>
                    )}
        
                    {/* Feedback / Complain Button (Direct WhatsApp to +8801642695161) */}
                    <a
                      href="https://wa.me/8801642695161?text=Hello%20Porabo%20Support%2C%20I%20have%20a%20feedback%20or%20complain"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden md:flex px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-400 hover:text-emerald-300 border border-emerald-600/60 text-xs font-semibold items-center gap-1.5 transition-all shadow-sm"
                      title="Direct WhatsApp Support: +8801642695161"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Feedback &amp; Complaints</span>
                    </a>
        
                    {/* Logout on Desktop */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      title="Sign Out"
                      className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs items-center gap-1.5 border border-slate-700 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
        
                    {/* Mobile 3-Dot Overflow Menu Button */}
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(true)}
                      className="sm:hidden p-2 rounded-xl bg-[#111827] text-slate-300 hover:text-white border border-blue-900/40 hover:border-blue-700/60 transition-colors"
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
