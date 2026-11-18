import { createContext, useContext } from "react";
import type { useAppController } from "./useAppController";

export type AppContextValue = ReturnType<typeof useAppController>;
export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("AppContext is not available outside App.");
  return context;
}
