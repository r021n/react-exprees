import { Link, useNavigate, useLocation } from "react-router-dom";
import { PropsWithChildren, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { Button } from "./ui/Button";

function Layout({ children }: PropsWithChildren) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const NavLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-indigo-600 ${
        isActive(to) ? "text-indigo-600" : "text-gray-600"
      }`}
    >
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-indigo-600">
                ArtisanCrate
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink to="/">Home</NavLink>
              {user && (
                <>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/subscriptions">Subscriptions</NavLink>
                  <NavLink to="/orders">Orders</NavLink>
                </>
              )}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                {user.role === "admin" && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Admin
                    </Button>
                  </Link>
                )}
                <Link to="/profile">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-4 shadow-lg">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-base font-medium text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-base font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/subscriptions"
                    className="text-base font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Subscriptions
                  </Link>
                  <Link
                    to="/orders"
                    className="text-base font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="text-base font-medium text-indigo-600"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-base font-medium text-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                </>
              )}
            </div>
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {user ? (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

export default Layout;
