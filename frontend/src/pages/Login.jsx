import { useState } from "react";
import { API } from "../Api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    const res = await API.post("/auth/login", form);
    localStorage.setItem("token", res.data.token);
    alert("Login successful");
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
