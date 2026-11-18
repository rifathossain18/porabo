import { useAppContext } from "../AppContext";
import { AuthenticationGateView } from "./auth/AuthenticationGateView";

export function AuthenticationGate() {
  const { currentUser } = useAppContext();

  if (currentUser) return null;

  return <AuthenticationGateView />;
}
