import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function ProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <div>loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export default ProtectedRoute;
