import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FirstAdmin from './pages/FirstAdmin';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function SplashOrRedirect() {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userRole = userDoc.exists() ? userDoc.data().role : 'user';
        setRole(userRole);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    checkRole();
  }, [currentUser]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!currentUser) return <Login />;
  if (role === 'admin') return <Navigate to="/admin-dashboard" />;
  return <Navigate to="/dashboard" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<SplashOrRedirect />} />
                  <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                  <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/first-admin" element={<FirstAdmin />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                </Routes>
              </div>
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
