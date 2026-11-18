import { useAppContext } from "./AppContext";
import { StudentExamRoute } from "./views/StudentExamRoute";
import { AdminRoute } from "./views/AdminRoute";
import { LandingGate } from "./views/LandingGate";
import { AuthenticationGate } from "./views/AuthenticationGate";
import { TeacherProfilePage } from "./views/TeacherProfilePage";
import { MainDashboard } from "./views/MainDashboard";

export function AppRoutes() {
  const {
    activeExamId,
    isAdminView,
    currentUser,
    showAuthForm,
    viewingTeacherProfileId,
    viewingTeacherProfile,
  } = useAppContext();

  if (activeExamId) return <StudentExamRoute />;
  if (isAdminView) return <AdminRoute />;
  if (!currentUser && !showAuthForm) return <LandingGate />;
  if (!currentUser) return <AuthenticationGate />;
  if (viewingTeacherProfileId && viewingTeacherProfile) {
    return <TeacherProfilePage />;
  }
  return <MainDashboard />;
}
