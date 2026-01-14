import './App.css';
import { useState, useEffect } from 'react';
import Auth from './pages/Auth.jsx';
import Home from './pages/Home.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState('auth');

  useEffect(() => {
    // Check authentication and route on mount
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        const path = window.location.pathname;
        
        if (path === '/home') {
          if (token) {
            setCurrentPage('home');
          } else {
            setCurrentPage('auth');
          }
        } else {
          if (token) {
            setCurrentPage('home');
          } else {
            setCurrentPage('auth');
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setCurrentPage('auth');
      }
    };

    checkAuth();
  }, []);

  // Determine which page to show
  const path = window.location.pathname;
  const token = localStorage.getItem("token");
  
  let showPage = 'auth';
  if (path === '/home' && token) {
    showPage = 'home';
  } else if (path === '/home' && !token) {
    showPage = 'auth';
  } else if (path === '/' && token) {
    showPage = 'home';
  } else {
    showPage = 'auth';
  }

  return (
    <div className="App">
      {showPage === 'home' ? <Home /> : <Auth />}
    </div>
  );
}

export default App;
