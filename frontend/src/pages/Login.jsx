import { useState } from "react";
import { API } from "../Api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    try {
      const res = await API.post("/auth/login", form);
      console.log('Login response:', res.data);
      console.log('User role:', res.data.user.role);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful");
      
      // Redirect based on role
      if (res.data.user.role === 'admin') {
        console.log('Redirecting to admin page');
        window.location.href = "/admin";
      } else {
        console.log('Redirecting to home page');
        window.location.href = "/home";
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + (error.response?.data?.message || "Invalid credentials"));
    }
  };

  return (
    <>
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})} />
      <input placeholder="Password" type="password" onChange={e => setForm({...form, password:e.target.value})} />
      <button onClick={submit}>Login</button>
    </>
  );
}

export default Login;
