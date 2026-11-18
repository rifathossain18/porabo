import { useCallback, useEffect, useState } from "react";

export function useAdminRoute() {
  const checkIsAdminRoute = useCallback(() => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    const search = window.location.search;
    return (
      path === "/admin" ||
      path === "/admin/" ||
      path.startsWith("/admin") ||
      hash === "#/admin" ||
      hash === "#admin" ||
      search.includes("admin=true") ||
      search.includes("admin=1") ||
      search === "?admin"
    );
  }, []);

  const [isAdminView, setIsAdminView] = useState(checkIsAdminRoute);

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminView(checkIsAdminRoute());
    };

    handleLocationChange();
    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);

    const timer = setInterval(() => {
      const match = checkIsAdminRoute();
      setIsAdminView((previous) => (previous !== match ? match : previous));
    }, 150);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.altKey &&
        (event.key === "a" || event.key === "A")
      ) {
        event.preventDefault();
        setIsAdminView((previous) => {
          const next = !previous;
          window.history.pushState({}, "", next ? "/admin" : "/");
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(timer);
    };
  }, [checkIsAdminRoute]);

  return { checkIsAdminRoute, isAdminView, setIsAdminView };
}
