import { AppContext } from "./app/AppContext";
import { AppRoutes } from "./app/AppRoutes";
import { useAppController } from "./app/useAppController";

export default function App() {
  const appController = useAppController();

  return (
    <AppContext.Provider value={appController}>
      <AppRoutes />
    </AppContext.Provider>
  );
}
