import { useState } from "react";
import { API } from "../Api";

function AdminSignup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", employeeId: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Submitting admin signup with:', { ...form, password: '***' });
      const res = await API.post("/auth/signup", form);
      console.log('Admin signup response:', res.data);
      console.log('User role:', res.data.user.role);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      alert("Admin account created successfully!");
      window.location.href = "/admin";
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        Admin Account Creation
      </h2>
      
      <form onSubmit={submit}>
        <input 
          placeholder="Name" 
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} 
          style={{ width: "100%", padding: "12px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          required
        />
        
        <input 
          placeholder="Email" 
          type="email"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} 
          style={{ width: "100%", padding: "12px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          required
        />
        
        <input 
          placeholder="Password" 
          type="password" 
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} 
          style={{ width: "100%", padding: "12px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          required
          minLength="6"
        />

        <input 
          placeholder="Employee ID (Required)" 
          value={form.employeeId}
          onChange={e => setForm({...form, employeeId: e.target.value})} 
          style={{ width: "100%", padding: "12px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
          required
        />
        
        <button 
          type="submit"
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "12px", 
            margin: "10px 0", 
            backgroundColor: loading ? "#ccc" : "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "500"
          }}
        >
          {loading ? "Creating..." : "Create Admin Account"}
        </button>
      </form>
      
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        <button 
          onClick={() => window.location.href = "/"}
          style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
        >
          Back to Login
        </button>
      </p>
    </div>
  );
}

export default AdminSignup;
