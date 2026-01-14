import { useState } from "react";
import { API } from "../Api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Login successful");
      window.location.href = "/home";
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
