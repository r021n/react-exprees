import { useAuthStore } from "../store/authStore";

function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Selamat datang, {user?.name}</p>
      <p>Ini dashboard sederhana</p>
    </div>
  );
}

export default Dashboard;
