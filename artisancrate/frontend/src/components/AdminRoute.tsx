import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

function AdminRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}

export default AdminRoute;
