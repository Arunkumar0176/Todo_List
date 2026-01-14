import { useState } from "react";
import { API } from "../Api";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const res = await API.post("/auth/login", { 
          email: form.email, 
          password: form.password 
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("Login successful!");
        window.location.href = "/home";
      } else {
        const res = await API.post("/auth/signup", form);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        alert("Signup successful!");
        window.location.href = "/home";
      }
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
        {isLogin ? "Login" : "Sign Up"}
      </h2>
      
      <form onSubmit={submit}>
        {!isLogin && (
          <input 
            placeholder="Name" 
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} 
            style={{ width: "100%", padding: "12px", margin: "10px 0", border: "1px solid #ddd", borderRadius: "4px", boxSizing: "border-box" }}
            required
          />
        )}
        
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
          {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
        </button>
      </form>
      
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button 
          onClick={() => setIsLogin(!isLogin)}
          style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
        >
          {isLogin ? "Sign Up" : "Login"}
        </button>
      </p>
    </div>
  );
}

export default Auth;