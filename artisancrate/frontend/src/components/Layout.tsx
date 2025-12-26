import { Link, useNavigate } from "react-router-dom";
import { PropsWithChildren } from "react";
import { useAuthStore } from "../store/authStore";

function Layout({ children }: PropsWithChildren) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  return (
    <div>
      <header
        style={{
          padding: "1rem",
          borderBottom: "1px solid #ddd",
          marginBottom: "1rem",
        }}
      >
        <nav
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Link to="/">Home</Link>

          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/subscriptions">Subscriptions</Link>
              <Link to="/invoices">Invoices</Link>
              <Link to="/orders">Orders</Link>
              <Link to="/profile">Profil</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
      <main style={{ padding: "1rem" }}>{children}</main>
    </div>
  );
}

export default Layout;
