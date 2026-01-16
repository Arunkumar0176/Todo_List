import { useState } from "react";
import { API } from "../Api";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const submit = async () => {
    try {
      const res = await API.post("/auth/signup", form);
      console.log('Signup response:', res.data);
      console.log('User role:', res.data.user.role);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("Signup successful!");
      
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