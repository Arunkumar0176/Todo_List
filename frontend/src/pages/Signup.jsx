import { useState } from "react";
import { API } from "../Api";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    try {
      await API.post("/auth/signup", form);
      alert("Signup successful! Please login.");
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Error: " + (error.response?.data?.message || "Something went wrong"));
    }
  };

  return (
    <>
      <input placeholder="Name" onChange={e => setForm({...form, name:e.target.value})} />
      <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})} />
      <input placeholder="Password" type="password" onChange={e => setForm({...form, password:e.target.value})} />
      <button onClick={submit}>Signup</button>
    </>
  );
}

export default Signup;