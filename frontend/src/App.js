import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ViewerDashboard from './pages/ViewerDashboard';
import ViewerFilm from './pages/ViewerFilm';

const getUserFromLocalStorage = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

const App = () => {
  const [user, setUser] = useState(getUserFromLocalStorage());

  useEffect(() => {
    const storedUser = getUserFromLocalStorage();
    setUser(storedUser);
  }, []);

  const isAuthenticated = !!user;
  const role = user?.role;

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage setUser={setUser} /> : <Navigate to={`/${role}-dashboard`} />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to={`/${role}-dashboard`} />}
        />
        <Route
          path="/admin-dashboard/*"
          element={
            isAuthenticated && role === 'admin' ? (
              <AdminDashboard setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/viewer-dashboard/*"
          element={
            isAuthenticated && role === 'viewer' ? (
              <ViewerDashboard setUser={setUser} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? `/${role}-dashboard` : '/login'} />} />
        <Route
          path="/viewer-film/:id"
          element={
            isAuthenticated && (role === 'viewer' || role === 'admin')  ? (
              <ViewerFilm />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
