import { lazy, Suspense } from "react";
import { useAppContext } from "./AppContext";

const StudentExamRoute = lazy(() =>
  import("./views/StudentExamRoute").then((module) => ({
    default: module.StudentExamRoute,
  })),
);
const AdminRoute = lazy(() =>
  import("./views/AdminRoute").then((module) => ({
    default: module.AdminRoute,
  })),
);
const LandingGate = lazy(() =>
  import("./views/LandingGate").then((module) => ({
    default: module.LandingGate,
  })),
);
const AuthenticationGate = lazy(() =>
  import("./views/AuthenticationGate").then((module) => ({
    default: module.AuthenticationGate,
  })),
);
const TeacherProfilePage = lazy(() =>
  import("./views/TeacherProfilePage").then((module) => ({
    default: module.TeacherProfilePage,
  })),
);
const MainDashboard = lazy(() =>
  import("./views/MainDashboard").then((module) => ({
    default: module.MainDashboard,
  })),
);

export function AppRoutes() {
  const {
    activeExamId,
    isAdminView,
    currentUser,
    showAuthForm,
    viewingTeacherProfileId,
    viewingTeacherProfile,
  } = useAppContext();

  let route;
  if (activeExamId) route = <StudentExamRoute />;
  else if (isAdminView) route = <AdminRoute />;
  else if (!currentUser && !showAuthForm) route = <LandingGate />;
  else if (!currentUser) route = <AuthenticationGate />;
  else if (viewingTeacherProfileId && viewingTeacherProfile) {
    route = <TeacherProfilePage />;
  } else route = <MainDashboard />;

  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-dvh items-center justify-center bg-slate-50 text-sm font-medium text-slate-600"
          role="status"
          aria-live="polite"
        >
          Loading Porabo...
        </div>
      }
    >
      {route}
    </Suspense>
  );
}
