import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../../feature/auth/store";

//GuestRoute
interface GuestRouteProps {
  children: React.ReactNode;
}

function GuestRoute({ children }: GuestRouteProps) {
  const { accessToken, role } = useAuthStore();

  if (accessToken) {
    const redirect = role === "admin" ? "/admin" : "/";
    return <Navigate to={redirect} replace />;
  }
  return <>{children}</>;
}

export default GuestRoute;
