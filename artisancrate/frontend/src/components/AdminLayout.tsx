import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <aside
        style={{
          minWidth: 200,
          borderRight: "1px solid #ddd",
          paddingRight: "1rem",
        }}
      >
        <h3>Admin Panel</h3>
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <NavLink to="/admin" end>
            Dashboard
          </NavLink>
          <NavLink to="/admin/subscription-plans" end>
            Subscription Plans
          </NavLink>
          <NavLink to="/admin/subscriptions" end>
            Subscriptions
          </NavLink>
          <NavLink to="/admin/invoices" end>
            Invoices
          </NavLink>
          <NavLink to="/admin/orders" end>
            Orders
          </NavLink>
        </nav>
      </aside>
      <section style={{ flex: 1 }}>
        <Outlet />
      </section>
    </div>
  );
}

export default AdminLayout;
