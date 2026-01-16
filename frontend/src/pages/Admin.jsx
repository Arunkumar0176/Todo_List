import { useState, useEffect } from "react";
import { API } from "../Api";
import "./Home.css";

function Admin() {
  const [adminData, setAdminData] = useState({ users: [], todos: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [usersRes, todosRes, statsRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/todos"),
        API.get("/admin/stats")
      ]);
      setAdminData({
        users: usersRes.data,
        todos: todosRes.data,
        stats: statsRes.data
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Admin Dashboard</h1>
        <div className="header-buttons">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{adminData.stats.totalUsers || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Total Todos</h3>
            <p>{adminData.stats.totalTodos || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p>{adminData.stats.completedTodos || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{adminData.stats.pendingTodos || 0}</p>
          </div>
        </div>

        <div className="admin-section">
          <h3>All Users</h3>
          <div className="user-list">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {adminData.users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-section">
          <h3>All Todos</h3>
          <div className="todo-list">
            <table className="todo-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {adminData.todos.map((todo) => (
                  <tr key={todo._id}>
                    <td><strong>{todo.title}</strong></td>
                    <td>{todo.description || '-'}</td>
                    <td>{todo.user?.name}</td>
                    <td>
                      <span className={`status-badge ${todo.completed ? 'status-completed' : 'status-pending'}`}>
                        {todo.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;
