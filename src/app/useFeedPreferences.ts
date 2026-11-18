import { useEffect, useState } from "react";
import type { MouseEvent } from "react";

export function useFeedPreferences(showToast: (message: string) => void) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("porabo_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(theme);
    localStorage.setItem("porabo_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((previous) => (previous === "dark" ? "light" : "dark"));
  };

  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("porabo_hidden_posts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("porabo_hidden_posts", JSON.stringify(hiddenPostIds));
    } catch {}
  }, [hiddenPostIds]);

  const handleHidePost = (postId: string, event?: MouseEvent) => {
    event?.stopPropagation();
    setHiddenPostIds((previous) => [
      ...previous.filter((id) => id !== postId),
      postId,
    ]);
    showToast("Tuition post hidden from your feed.");
  };

  const handleUnhideAllPosts = () => {
    setHiddenPostIds([]);
    showToast("All hidden tuition posts restored!");
  };

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("porabo_recent_searches");
      return saved
        ? JSON.parse(saved)
        : ["Higher Math", "Physics", "English Version", "Dhanmondi", "Mirpur"];
    } catch {
      return [];
    }
  });

  const addRecentSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    setRecentSearches((previous) =>
      [
        trimmedQuery,
        ...previous.filter(
          (item) => item.toLowerCase() !== trimmedQuery.toLowerCase(),
        ),
      ].slice(0, 5),
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem("porabo_recent_searches", JSON.stringify(recentSearches));
    } catch {}
  }, [recentSearches]);

  return {
    theme,
    setTheme,
    toggleTheme,
    hiddenPostIds,
    setHiddenPostIds,
    handleHidePost,
    handleUnhideAllPosts,
    recentSearches,
    setRecentSearches,
    addRecentSearch,
  };
}
