import { useState } from "react";
import {Link,  useNavigate } from "react-router-dom";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:3000/api/vendor/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      navigate(`/vendor/${data.vendor_id}`);
    } else {
      setMsg(data.error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form className="bg-white p-6 rounded-xl shadow w-96" onSubmit={handleLogin}>
        <h2 className="text-xl font-bold mb-4">Vendor Login</h2>

        <input
          className="w-full p-2 mb-3 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
          <Link to="/register" className="text-sm text-blue-600 hover:underline">New to the system Register Here?</Link>
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Login
        </button>

        {msg && <p className="mt-3 text-center text-sm text-red-500">{msg}</p>}
      </form>
    </div>
  );
}
