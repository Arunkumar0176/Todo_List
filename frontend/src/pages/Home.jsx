import { useState, useEffect } from "react";
import { API } from "../Api";
import "./Home.css";

function Home() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "" });
  const [editingId, setEditingId] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadTodos();
    loadUser();
  }, []);

  const loadUser = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    }
  };

  const loadTodos = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/";
        return;
      }

      const res = await API.get("/todos");
      setTodos(res.data);
    } catch (error) {
      console.error("Error loading todos:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const title = form.title.trim();
    if (!title) {
      alert("Please enter a todo title");
      return;
    }

    try {
      if (editingId) {
        const res = await API.put(`/todos/${editingId}`, {
          title,
          description: form.description.trim() || ""
        });
        
        setTodos(todos.map(todo => 
          todo._id === editingId ? res.data : todo
        ));
        setEditingId(null);
      } else {
        const res = await API.post("/todos", {
          title,
          description: form.description.trim() || ""
        });
        
        setTodos([...todos, res.data]);
      }
      
      setForm({ title: "", description: "" });
    } catch (error) {
      console.error("Error saving todo:", error);
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  const handleEdit = (todo) => {
    setForm({ title: todo.title, description: todo.description || "" });
    setEditingId(todo._id);
  };

  const handleCancelEdit = () => {
    setForm({ title: "", description: "" });
    setEditingId(null);
  };

  const handleToggleComplete = async (todo) => {
    try {
      await API.put(`/todos/${todo._id}`, {
        completed: !todo.completed
      });
      loadTodos();
    } catch (error) {
      console.error("Error updating todo:", error);
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this todo?")) return;
    
    try {
      await API.delete(`/todos/${id}`);
      loadTodos();
    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
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
        <div>
          <h1>My Todo List</h1>
          {user && (
            <p className="user-info">
              Welcome, <strong>{user.name}</strong> 
            </p>
          )}
        </div>
        <div className="header-buttons">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="todo-form-container">
        <form onSubmit={handleSubmit} className="todo-form">
          <input
            type="text"
            placeholder="Todo title..."
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="todo-input"
            required
          />
          <textarea
            placeholder="Description (optional)..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="todo-textarea"
            rows="3"
          />
          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingId ? "Update Todo" : "Add Todo"}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="todos-container">
        {todos.length === 0 ? (
          <div className="empty-state">
            <p>No todos yet. Create your first todo above!</p>
          </div>
        ) : (
          <div className="todos-list">
            {todos.map((todo) => (
              <div
                key={todo._id}
                className={`todo-item ${todo.completed ? "completed" : ""}`}
              >
                <div className="todo-content">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                    className="todo-checkbox"
                  />
                  <div className="todo-text">
                    <h3 className={todo.completed ? "strikethrough" : ""}>
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p className={todo.completed ? "strikethrough" : ""}>
                        {todo.description}
                      </p>
                    )}
                    <small className="todo-date">
                      {new Date(todo.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div className="todo-actions">
                  <button
                    onClick={() => handleEdit(todo)}
                    className="edit-btn"
                    disabled={todo.completed}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
