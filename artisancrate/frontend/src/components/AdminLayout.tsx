import { NavLink, Outlet } from "react-router-dom";
import { cn } from "./ui/Button";

function AdminLayout() {
  const NavItem = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        )
      }
    >
      {children}
    </NavLink>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 shrink-0">
        <div className="flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Admin Panel
          </h3>
          <nav className="space-y-1">
            <NavItem to="/admin">Dashboard</NavItem>
            <NavItem to="/admin/subscription-plans">Subscription Plans</NavItem>
            <NavItem to="/admin/subscriptions">Subscriptions</NavItem>
            <NavItem to="/admin/invoices">Invoices</NavItem>
            <NavItem to="/admin/orders">Orders</NavItem>
          </nav>
        </div>
      </aside>
      <section className="flex-1 min-w-0">
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
