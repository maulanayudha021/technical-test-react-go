import React, { useState, useEffect } from 'react';
import { Routes, Route, BrowserRouter, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Users from './components/User';
import Products from './components/Products'; // Corrected Products import

export default function App() {
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Get the user's name and email from localStorage
  useEffect(() => {
    if (isAuthenticated) {
      const storedName = localStorage.getItem('name');
      const storedEmail = localStorage.getItem('email');
      setUserName(storedName);
      setUserEmail(storedEmail);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    setUserName(null); // Clear user name state
    setUserEmail(null); // Clear user email state
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black">
        {/* Navigation Menu (conditionally rendered based on authentication) */}
        {isAuthenticated ? (
          <div className="flex justify-between p-4 bg-black text-white">
            {/* Navigation Menu */}
            <div className="flex items-center">
              <Link to="/dashboard" className="px-4 py-2 hover:bg-blue-700 rounded">Dashboard</Link>
              <Link to="/users" className="px-4 py-2 hover:bg-blue-700 rounded">Users</Link>
              <Link to="/products" className="px-4 py-2 hover:bg-blue-700 rounded">Products</Link>
            </div>

            {/* Logged-in User Info and Logout Button */}
            {isAuthenticated && userName && userEmail ? (
              <div className="flex items-center space-x-4">
                <span className="mr-3">{`Welcome, ${userName}`}</span>
                <button 
                  onClick={handleLogout} 
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-all duration-300 ease-in-out">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="px-4 py-2 hover:bg-blue-700 rounded">Login</Link>
                <Link to="/register" className="px-4 py-2 hover:bg-blue-700 rounded">Register</Link>
              </div>
            )}
          </div>
        ) : (
          // When not authenticated, change the class and hide the menu
          <div className="flex justify-center p-4 bg-black text-white">
            <div className="flex items-center space-x-4">
              <Link to="/login" className="px-4 py-2 hover:bg-blue-700 rounded">Login</Link>
              <Link to="/register" className="px-4 py-2 hover:bg-blue-700 rounded">Register</Link>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center min-h-screen bg-white">
          <div className="w-full max-w-xl bg-white p-4 rounded-lg shadow-lg"> {/* Reduced the width here */}
            <Routes>
              <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
              />
              <Route
                path="/dashboard"
                element={isAuthenticated ? (
                  <div className="p-4">
                    <center>
                      <img
                        src="/avatar.svg"
                        alt="Avatar"
                        style={{ width: '30%' }}
                      />
                      <h2 className="text-3xl font-bold mb-6 text-black mt-4">Dashboard</h2>
                      <p className="text-black">Welcome, {userName}.<br />Your email is: {userEmail}</p>
                    </center>
                  </div>
                ) : (
                  <Navigate to="/login" />
                )}
              />
              <Route
                path="/users"
                element={isAuthenticated ? <Users /> : <Navigate to="/login" />}
              />
              <Route
                path="/products"
                element={isAuthenticated ? <Products /> : <Navigate to="/login" />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}
