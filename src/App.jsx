import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FirstAdmin from './pages/FirstAdmin';
import AdminDashboard from './pages/AdminDashboard';
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

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
      <LanguageProvider>
        <AuthProvider>
          <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<SplashOrRedirect />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/first-admin" element={<FirstAdmin />} />
                <Route path="/home" element={<Home />} />
              </Routes>
            </div>
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
