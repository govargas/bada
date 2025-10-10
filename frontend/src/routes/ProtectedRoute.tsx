import { Navigate, Outlet, useLocation } from "react-router";
import { isAuthenticated } from "@/store/auth";

export default function ProtectedRoute() {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
