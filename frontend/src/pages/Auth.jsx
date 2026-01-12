import { useState } from "react";
import { API } from "../Api";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    try {
      if (isLogin) {
        const res = await API.post("/auth/login", { email: form.email, password: form.password });
        localStorage.setItem("token", res.data.token);
        alert("Login successful");
      } else {
        await API.post("/auth/signup", form);
        alert("Signup successful");
      }
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      
      {!isLogin && (
        <input 
          placeholder="Name" 
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} 
          style={{ width: "100%", padding: "10px", margin: "10px 0" }}
        />
      )}
      
      <input 
        placeholder="Email" 
        type="email"
        value={form.email}
        onChange={e => setForm({...form, email: e.target.value})} 
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
      />
      
      <input 
        placeholder="Password" 
        type="password" 
        value={form.password}
        onChange={e => setForm({...form, password: e.target.value})} 
        style={{ width: "100%", padding: "10px", margin: "10px 0" }}
      />
      
      <button 
        onClick={submit}
        style={{ width: "100%", padding: "10px", margin: "10px 0", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}
      >
        {isLogin ? "Login" : "Sign Up"}
      </button>
      
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