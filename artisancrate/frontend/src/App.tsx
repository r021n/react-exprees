import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import PlanDetail from "./pages/PlanDetail";
import ConfirmSubscriptionPlan from "./pages/ConfirmSubscription";
import Subscriptions from "./pages/Subscriptions";
import SubscriptionDetail from "./pages/SubscriptionDetail";
import Invoices from "./pages/Invoices";
import InvoiceDetail from "./pages/InvoiceDetail";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSubscriptionPlans from "./pages/admin/AdminSubscriptionPlans";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminSubscriptionDetail from "./pages/admin/AdminSubscriptionDetail";
import AdminInvoices from "./pages/admin/AdminInvoices";
import AdminOrders from "./pages/admin/AdminOrders";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/plans/:id" element={<PlanDetail />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/subscribe/confirm"
            element={<ConfirmSubscriptionPlan />}
          />

          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/subscriptions/:id" element={<SubscriptionDetail />} />

          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/Orders/:id" element={<OrderDetail />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route
              path="subscription-plans"
              element={<AdminSubscriptionPlans />}
            />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
            <Route
              path="subscriptions/:id"
              element={<AdminSubscriptionDetail />}
            />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="orders" element={<AdminOrders />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;
