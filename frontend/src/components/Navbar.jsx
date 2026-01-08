import React, { useState, useEffect } from "react";

export default function Navbar() {

  const [vendor, setVendor] = useState(JSON.parse(localStorage.getItem("vendor")));

  const handleLogout = () => {
    localStorage.removeItem("vendor");
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setVendor(JSON.parse(localStorage.getItem("vendor")));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <nav className="w-full flex justify-between items-center px-10 py-4 shadow bg-white">
      <div className="text-2xl font-bold">Fleamarket</div>

      <div className="flex space-x-6">
        <a href="/" className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md 
               hover:bg-gray-100 hover:text-gray-900 transition">Home</a>
        <a href="/vendors" className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md 
               hover:bg-gray-100 hover:text-gray-900 transition">Vendors</a>
        <a href="/booths" className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md 
               hover:bg-gray-100 hover:text-gray-900 transition">Booths</a>

      
        {/* vendor logged in only */}
        {vendor && (
          <>
            <a href="/stats" className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md 
               hover:bg-gray-100 hover:text-gray-900 transition">Dashboard</a>
            <a href="/reserve" className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md 
               hover:bg-gray-100 hover:text-gray-900 transition">Reserve Booth</a>
          </>
        )}
        
        {/* dynamic login/logout selection */}
        {vendor ? (
          <a href="/login" onClick={handleLogout} className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md 
               hover:bg-gray-100 hover:text-gray-900 transition">
            Logout
          </a>
        ) : (
          <a href="/login" className="flex items-center gap-2 text-gray-700 px-3 py-2 rounded-md 
               hover:bg-gray-100 hover:text-gray-900 transition">Login</a>
        )}
      </div>
    </nav>
  );
}
