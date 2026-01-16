import './App.css';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth.jsx';
import Home from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';
import AdminSignup from './pages/AdminSignup.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const path = window.location.pathname;
        
        if (path === '/home' && token) {
          setCurrentPage('home');
        } else if (path === '/admin' && token) {
          setCurrentPage('admin');
        } else if (path === '/admin-signup') {
          setCurrentPage('admin-signup');
        } else if (token) {
          setCurrentPage('home');
        } else {
          setCurrentPage('auth');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setCurrentPage('auth');
      }
    };

    checkAuth();
  }, []);

  const path = window.location.pathname;
  const token = localStorage.getItem("token");
  
  let showPage = 'auth';
  if (path === '/home' && token) {
    showPage = 'home';
  } else if (path === '/admin' && token) {
    showPage = 'admin';
  } else if (path === '/admin-signup') {
    showPage = 'admin-signup';
  } else if (token) {
    showPage = 'home';
  } else {
    showPage = 'auth';
  }

  return (
    <div className="App">
      {showPage === 'home' && <Home />}
      {showPage === 'admin' && <Admin />}
      {showPage === 'admin-signup' && <AdminSignup />}
      {showPage === 'auth' && <Auth />}
    </div>
  );
}

export default App;
